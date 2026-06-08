# Mental Health Analytics Dashboard

## Description

This project is an interactive mental health analytics dashboard designed to help users explore trends and patterns in mental health survey data. The application combines a React frontend, D3 visualizations, and a FastAPI backend to provide an interactive environment for filtering, analyzing, and visualizing mental health-related information.

The dashboard allows users to:

* Explore demographic characteristics of survey respondents.
* Analyze relationships between mental health indicators and workplace factors.
* Filter data by demographic and survey attributes.
* Interact with visualizations through zooming, filtering, and selection.
* View detailed statistics and trends through multiple coordinated charts.

The frontend is built using React and D3.js, while the backend is implemented using FastAPI. Data is stored in CSV format and served through API endpoints that support interactive analysis.

---

## Installation

### Prerequisites

* Python 3.11+
* Node.js 18+
* npm

### Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### Frontend Setup

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

## Execution

### Start the Backend

From the backend directory:

```bash
uvicorn main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

### Start the Frontend

From the frontend directory:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

### Using the Dashboard

1. Open the frontend URL in a web browser.
2. Explore the available visualizations.
3. Apply filters to focus on specific demographic groups.
4. Interact with charts to view detailed information.
5. Analyze trends and relationships within the mental health dataset.

---

## Dataset

The project uses a mental health survey dataset. If the dataset is not included in the repository due to size limitations, download it from the original source and place it in the designated data directory before running the application.

---

## Known Issues

* Initial loading may take several seconds depending on dataset size.
* Some visualizations may require a modern Chromium-based browser for best performance.
* Backend and frontend must both be running for full functionality.
