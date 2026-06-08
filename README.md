# Mental Health Visual Analytics Dashboard

## Description

This project presents an interactive visual analytics dashboard for exploring large-scale mental health survey data. The system combines visual exploration techniques with computational analysis to help users identify patterns in treatment-seeking behavior, stress levels, coping struggles, and other mental health indicators.

The dashboard was developed using a full-stack architecture consisting of a React frontend, FastAPI backend, and MongoDB database. Interactive visualizations were implemented using D3.js and Recharts.

The application contains three primary analysis views:

* **Overview Analysis:** Interactive bar charts for exploring treatment-seeking behavior, stress levels, mood swings, and care-option awareness across demographic groups.
* **Relationship Analysis:** A Sankey diagram showing pathways among family history, stress, coping struggles, and treatment-seeking behavior.
* **Cluster Analysis:** PCA-based projections and K-Means clustering used to identify behavioral patterns and respondent groups within the survey population.

The dashboard supports dynamic filtering by gender, occupation, and country, allowing users to explore specific subpopulations and compare mental health trends across demographic groups.

---

## Installation

### Prerequisites

* Node.js (v18 or newer)
* Python 3.10+
* MongoDB Community Server

### Clone the Repository

```bash
git clone https://github.com/mreza822/ECS-273-Spring-2026-Project
cd mental_health
```

### Backend Setup

Navigate to the backend directory:

```bash
cd server
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### Frontend Setup

Navigate to the client directory:

```bash
cd client
npm install
```

### MongoDB

Start MongoDB locally:

```bash
mongod
```

Ensure the MongoDB server is running before launching the backend.

Another alternative is through the MongoDB Compass app. First, make sure MongoDB is active on your device:

```bash
Get-Service MongoDB
```

If it says "Running", then open the MongoDB Compass app connect to `localhost:27017`.

---

## Importing the Data

Make sure you are in the `server` directory. While the MongoDB server is running, run this command:

```bash
python import_data.py
```

This command executes the according file and loads the file into the MongoDB databse. This will appear in the Compass app.

## Execution

### Start the Backend

From the server directory:

```bash
uvicorn main:app --reload
```

The API should be available at:

```text
http://localhost:8000
```

### Start the Frontend

From the client directory:

```bash
npm run dev
```

The dashboard should be available at:

```text
http://localhost:5173
```

### Using the Dashboard

1. Open the dashboard in a web browser.
2. Explore the **Overview** tab to view demographic trends.
3. Use the **Relationships** tab to investigate mental health pathways through the Sankey diagram.
4. Use the **Clusters** tab to explore PCA projections and K-Means cluster results.
5. Apply filters for gender, occupation, and country to investigate specific populations.

---

## Dataset

The project uses a large-scale mental health survey dataset containing approximately 292,000 responses and demographic, behavioral, and treatment-related variables.

Due to dataset size, the original raw data is not included directly in the repository. A smaller subset of 80 randomly sampled records are included in the repository for demonstration purposes. Any preprocessing scripts used to clean, encode, and prepare the data are included in the project source code.

To view the dashboard with the true, large dataset, download the dataset from https://www.kaggle.com/datasets/bhavikjikadara/mental-health-dataset. There is an option to download the data as a ZIP file. Extract the ZIP file to the `server/data` directory, and remove the smaller, simplifed dataset. Make sure to rename the just downloaded dataset as `mental_health_dataset.csv`, or else the code will not run, as this is the path name called upon across the files.

---

## Technologies Used

* React
* Vite
* D3.js
* Recharts
* FastAPI
* MongoDB
* Python
* Scikit-learn (PCA and K-Means)
