from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from collections import Counter, defaultdict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.mental_health_database

records_collection = db.get_collection("mental_health_records")
clusters_collection = db.get_collection("clusters")


def clean_filter(value):
    if value is None or value == "" or value == "All":
        return None
    return value


def build_query(gender=None, occupation=None, country=None):
    query = {}

    gender = clean_filter(gender)
    occupation = clean_filter(occupation)
    country = clean_filter(country)

    if gender:
        query["Gender"] = gender
    if occupation:
        query["Occupation"] = occupation
    if country:
        query["Country"] = country

    return query


def grouped_percent(docs, group_key, category_key, allowed_categories=None, top_n=None):
    group_counts = defaultdict(Counter)

    for d in docs:
        group = d.get(group_key, "Unknown")
        category = d.get(category_key, "Unknown")

        if group is None:
            group = "Unknown"
        if category is None:
            category = "Unknown"

        group_counts[str(group)][str(category)] += 1

    groups = list(group_counts.keys())

    if top_n is not None:
        groups = sorted(
            groups,
            key=lambda g: sum(group_counts[g].values()),
            reverse=True
        )[:top_n]

    rows = []

    for group in groups:
        total = sum(group_counts[group].values())

        categories = allowed_categories or list(group_counts[group].keys())

        for category in categories:
            count = group_counts[group].get(category, 0)
            percentage = round((count / total) * 100, 1) if total else 0

            rows.append({
                "group": group,
                "category": category,
                "count": count,
                "percentage": percentage
            })

    return rows


@app.get("/")
async def root():
    return {
        "message": "Mental Health Visual Analytics API is running",
        "database": "mental_health_database"
    }


@app.get("/api/count")
async def get_count():
    count = await records_collection.count_documents({})
    return {"count": count}


@app.get("/api/overview")
async def get_overview(
    gender: str = Query("All"),
    occupation: str = Query("All"),
    country: str = Query("All")
):
    query = build_query(gender, occupation, country)

    docs = await records_collection.find(query).to_list(length=None)

    if not docs:
        raise HTTPException(status_code=404, detail="No matching records found.")

    countries = len(set(d.get("Country", "Unknown") for d in docs))
    occupations = len(set(d.get("Occupation", "Unknown") for d in docs))

    return {
        "metadata": {
            "total_records": len(docs),
            "countries": countries,
            "occupations": occupations
        },
        "treatment_by_occupation": grouped_percent(
            docs,
            "Occupation",
            "treatment",
            ["Yes", "No"]
        ),
        "stress_by_occupation": grouped_percent(
            docs,
            "Occupation",
            "Growing_Stress",
            ["Yes", "Maybe", "No"]
        ),
        "mood_by_gender": grouped_percent(
            docs,
            "Gender",
            "Mood_Swings",
            ["Low", "Medium", "High"]
        ),
        "care_by_country": grouped_percent(
            docs,
            "Country",
            "care_options",
            ["Yes", "Not sure", "No"],
            top_n=8
        )
    }


@app.get("/api/sankey")
async def get_sankey(
    gender: str = Query("All"),
    occupation: str = Query("All"),
    country: str = Query("All")
):
    query = build_query(gender, occupation, country)

    docs = await records_collection.find(query).to_list(length=None)

    if not docs:
        raise HTTPException(status_code=404, detail="No matching records found.")

    nodes = []
    node_index = {}
    links_counter = Counter()

    def add_node(name, stage):
        key = f"{stage}:{name}"

        if key not in node_index:
            node_index[key] = len(nodes)
            nodes.append({
                "name": name,
                "stage": stage
            })

        return node_index[key]

    for d in docs:
        family = str(d.get("family_history", "Unknown"))
        stress = str(d.get("Growing_Stress", "Unknown"))
        coping = str(d.get("Coping_Struggles", "Unknown"))
        treatment = str(d.get("treatment", "Unknown"))

        path = [
            (family, 0),
            (stress, 1),
            (coping, 2),
            (treatment, 3)
        ]

        for i in range(len(path) - 1):
            source = add_node(path[i][0], path[i][1])
            target = add_node(path[i + 1][0], path[i + 1][1])
            links_counter[(source, target)] += 1

    links = [
        {
            "source": source,
            "target": target,
            "value": value
        }
        for (source, target), value in links_counter.items()
    ]

    return {
        "nodes": nodes,
        "links": links,
        "total_records": len(docs)
    }


@app.get("/api/clusters")
async def get_clusters(
    gender: str = Query("All"),
    occupation: str = Query("All"),
    country: str = Query("All")
):
    doc = await clusters_collection.find_one({})

    if doc is None:
        raise HTTPException(
            status_code=404,
            detail="No cluster data found. Run python import_data.py first."
        )

    points = doc.get("points", [])

    gender_filter = clean_filter(gender)
    occupation_filter = clean_filter(occupation)
    country_filter = clean_filter(country)

    if gender_filter:
        points = [p for p in points if p.get("gender") == gender_filter]
    if occupation_filter:
        points = [p for p in points if p.get("occupation") == occupation_filter]
    if country_filter:
        points = [p for p in points if p.get("country") == country_filter]

    summaries = []

    clusters = sorted(set(p.get("cluster") for p in points))

    for cluster in clusters:
        cluster_points = [p for p in points if p.get("cluster") == cluster]
        size = len(cluster_points)

        if size == 0:
            continue

        treatment_yes = sum(1 for p in cluster_points if p.get("treatment") == "Yes")
        coping_yes = sum(1 for p in cluster_points if p.get("coping") == "Yes")

        occupation_counts = Counter(p.get("occupation", "Unknown") for p in cluster_points)
        stress_counts = Counter(p.get("stress", "Unknown") for p in cluster_points)

        summaries.append({
            "cluster": cluster,
            "size": size,
            "percentage": round((size / len(points)) * 100, 1) if points else 0,
            "treatment_rate": round((treatment_yes / size) * 100, 1),
            "coping_rate": round((coping_yes / size) * 100, 1),
            "top_occupation": occupation_counts.most_common(1)[0][0],
            "dominant_stress": stress_counts.most_common(1)[0][0],
            "dominant_mood": "N/A"
        })

    return {
        "points": points,
        "summaries": summaries,
        "sample_size": len(points),
        "total_records": doc.get("total_records", len(points)),
        "pca_variance": doc.get("pca_variance", [0, 0])
    }