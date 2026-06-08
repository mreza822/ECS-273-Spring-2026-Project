import os
import asyncio
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.mental_health_database

records_collection = db.get_collection("mental_health_records")
overview_collection = db.get_collection("overview")
sankey_collection = db.get_collection("sankey")
clusters_collection = db.get_collection("clusters")


def get_col(df, possible_names):
    for name in possible_names:
        if name in df.columns:
            return name
    raise KeyError(f"Could not find any of these columns: {possible_names}")


async def import_data():
    csv_path = os.path.join("data", "mental_health_dataset.csv")

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Could not find CSV at {csv_path}")

    df = pd.read_csv(csv_path)
    df = df.where(pd.notnull(df), None)

    print(f"Loaded {len(df)} rows")
    print(f"Columns: {list(df.columns)}")

    gender_col = get_col(df, ["Gender", "gender"])
    occupation_col = get_col(df, ["Occupation", "occupation"])
    country_col = get_col(df, ["Country", "country"])
    stress_col = get_col(df, ["Growing_Stress", "Growing Stress", "growing_stress"])
    treatment_col = get_col(df, ["treatment", "Treatment"])
    family_col = get_col(df, ["family_history", "Family_History", "Family History"])
    coping_col = get_col(df, ["Coping_Struggles", "Coping Struggles", "coping_struggles"])

    # --------------------------------------------------
    # Raw records
    # --------------------------------------------------

    await records_collection.delete_many({})

    records = df.to_dict("records")
    chunk_size = 5000

    for i in range(0, len(records), chunk_size):
        await records_collection.insert_many(records[i:i + chunk_size])
        print(f"Inserted raw records: {min(i + chunk_size, len(records))}/{len(records)}")

    # --------------------------------------------------
    # Overview data
    # --------------------------------------------------

    await overview_collection.delete_many({})

    occupation_stress = (
        df.groupby([occupation_col, stress_col])
        .size()
        .reset_index(name="count")
        .to_dict("records")
    )

    treatment_by_gender = (
        df.groupby([gender_col, treatment_col])
        .size()
        .reset_index(name="count")
        .to_dict("records")
    )

    treatment_by_country = (
        df.groupby([country_col, treatment_col])
        .size()
        .reset_index(name="count")
        .to_dict("records")
    )

    await overview_collection.insert_one({
        "occupation_stress": occupation_stress,
        "treatment_by_gender": treatment_by_gender,
        "treatment_by_country": treatment_by_country,
        "total_records": len(df)
    })

    print("Overview collection imported.")

    # --------------------------------------------------
    # Sankey data
    # --------------------------------------------------

    await sankey_collection.delete_many({})

    sankey_df = (
        df.groupby([family_col, stress_col, coping_col, treatment_col])
        .size()
        .reset_index(name="count")
    )

    nodes = []
    node_index = {}
    links = {}

    def add_node(label):
        if label not in node_index:
            node_index[label] = len(nodes)
            nodes.append({"name": label})
        return node_index[label]

    for _, row in sankey_df.iterrows():
        path = [
            f"Family History: {row[family_col]}",
            f"Growing Stress: {row[stress_col]}",
            f"Coping Struggles: {row[coping_col]}",
            f"Treatment: {row[treatment_col]}"
        ]

        count = int(row["count"])

        for i in range(len(path) - 1):
            source = add_node(path[i])
            target = add_node(path[i + 1])
            key = (source, target)
            links[key] = links.get(key, 0) + count

    sankey_links = [
        {"source": source, "target": target, "value": value}
        for (source, target), value in links.items()
    ]

    await sankey_collection.insert_one({
        "nodes": nodes,
        "links": sankey_links,
        "total_records": len(df)
    })

    print("Sankey collection imported.")

    # --------------------------------------------------
    # Cluster placeholder data
    # --------------------------------------------------
    # This creates usable cluster data for the frontend now.
    # Later we can replace it with real PCA/K-Means output.

    await clusters_collection.delete_many({})

    sample = df.sample(n=min(3000, len(df)), random_state=42).copy()

    cluster_points = []

    occupation_codes = {
        value: idx for idx, value in enumerate(sample[occupation_col].dropna().unique())
    }

    stress_codes = {
        value: idx for idx, value in enumerate(sample[stress_col].dropna().unique())
    }

    for _, row in sample.iterrows():
        occupation = row[occupation_col]
        stress = row[stress_col]

        occ_code = occupation_codes.get(occupation, 0)
        stress_code = stress_codes.get(stress, 0)

        cluster = occ_code % 5

        cluster_points.append({
            "x": float(occ_code + stress_code * 0.15),
            "y": float(stress_code + cluster * 0.2),
            "cluster": int(cluster),
            "occupation": occupation,
            "gender": row[gender_col],
            "country": row[country_col],
            "stress": stress,
            "treatment": row[treatment_col],
            "coping": row[coping_col],
        })

    await clusters_collection.insert_one({
        "points": cluster_points,
        "total_records": len(df),
        "sample_size": len(cluster_points)
    })

    print("Clusters collection imported.")

    print("--------------------------------")
    print("Import complete.")
    print("Database: mental_health_msreza")
    print("Collections created:")
    print("- mental_health_records")
    print("- overview")
    print("- sankey")
    print("- clusters")
    print("--------------------------------")


async def main():
    await import_data()


if __name__ == "__main__":
    asyncio.run(main())