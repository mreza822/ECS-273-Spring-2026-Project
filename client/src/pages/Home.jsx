import React from 'react';
import { BarChart3, GitBranch, ScatterChart } from 'lucide-react';

export default function Home({ navigate }) {
  return (
    <section className="home">
      <h1>Welcome to My Visual Analytics Project</h1>
      <p className="subtitle">
        Explore mental health survey responses through coordinated D3 visualizations,
        relationship analysis, and PCA/K-Means cluster exploration.
      </p>
      <div className="cards">
        <button className="home-card" onClick={() => navigate('overview')}>
          <BarChart3 size={34} />
          <h2>Overview Analysis</h2>
          <p>Compare treatment, stress, mood swings, and care options across demographic groups.</p>
        </button>
        <button className="home-card" onClick={() => navigate('relationships')}>
          <GitBranch size={34} />
          <h2>Relationship Analysis</h2>
          <p>Use a Sankey diagram to trace pathways from family history to stress, coping, and treatment.</p>
        </button>
        <button className="home-card" onClick={() => navigate('clusters')}>
          <ScatterChart size={34} />
          <h2>Cluster Analysis</h2>
          <p>Explore PCA-projected respondent clusters generated from encoded survey features.</p>
        </button>
      </div>
    </section>
  );
}
