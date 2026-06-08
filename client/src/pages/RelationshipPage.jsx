import React, { useEffect, useState } from 'react';
import { fetchJson } from '../utils/api.js';
import Filters from '../components/Filters.jsx';
import SankeyChart from '../components/SankeyChart.jsx';

function buildQuery(filters) {
  const params = new URLSearchParams();

  if (filters.gender !== 'All') params.append('gender', filters.gender);
  if (filters.occupation !== 'All') params.append('occupation', filters.occupation);
  if (filters.country !== 'All') params.append('country', filters.country);

  const query = params.toString();
  return query ? `/sankey?${query}` : '/sankey';
}

export default function RelationshipPage() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    gender: 'All',
    occupation: 'All',
    country: 'All'
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);

    fetchJson(buildQuery(filters))
      .then(setData)
      .catch(e => setError(e.message));
  }, [filters]);

  if (error) {
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page">
        <p>Loading relationships...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Filters filters={filters} setFilters={setFilters} />

      <section className="page-content">
        <h1>Relationship Analysis</h1>
        <p className="subtitle-small">
          Trace aggregate pathways from family history to stress, coping struggles, and treatment.
        </p>

        <div className="panel large">
          <SankeyChart data={data} />
        </div>
      </section>

      <aside className="insights">
        <h3>Pathway Insights</h3>
        <p>
          Flow width indicates the number of respondents moving between adjacent response categories.
        </p>
        <p>
          Total respondents: <b>{(data.total_records ?? 0).toLocaleString()}</b>
        </p>
      </aside>
    </div>
  );
}