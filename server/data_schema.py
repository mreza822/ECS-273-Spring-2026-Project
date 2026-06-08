from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class Metadata(BaseModel):
    total_records: int
    attributes: List[str]
    countries: int
    occupations: int
    generated_at: Optional[str] = None

class OverviewResponse(BaseModel):
    metadata: Metadata
    treatment_by_occupation: List[Dict[str, Any]]
    stress_by_occupation: List[Dict[str, Any]]
    mood_by_gender: List[Dict[str, Any]]
    care_by_country: List[Dict[str, Any]]
    treatment_by_gender: List[Dict[str, Any]]

class SankeyNode(BaseModel):
    name: str
    stage: str

class SankeyLink(BaseModel):
    source: int
    target: int
    value: int

class SankeyResponse(BaseModel):
    nodes: List[SankeyNode]
    links: List[SankeyLink]
    total_records: int

class ClusterPoint(BaseModel):
    x: float
    y: float
    cluster: int
    gender: str
    occupation: str
    country: str
    treatment: str
    stress: str
    mood: str
    coping: str

class ClusterSummary(BaseModel):
    cluster: int
    size: int
    percentage: float
    top_occupation: str
    treatment_rate: float
    coping_rate: float
    dominant_stress: str
    dominant_mood: str

class ClusterResponse(BaseModel):
    points: List[ClusterPoint]
    summaries: List[ClusterSummary]
    pca_variance: List[float]
    sample_size: int
