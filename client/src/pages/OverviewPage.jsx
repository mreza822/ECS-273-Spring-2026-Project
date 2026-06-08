import React, { useEffect, useState } from 'react';
import { fetchJson } from '../utils/api.js';
import Filters from '../components/Filters.jsx';
import GroupedBarChart from '../components/GroupedBarChart.jsx';

function buildQuery(filters) {
  const params = new URLSearchParams();

  if (filters.gender !== 'All') params.append('gender', filters.gender);
  if (filters.occupation !== 'All') params.append('occupation', filters.occupation);
  if (filters.country !== 'All') params.append('country', filters.country);

  const query = params.toString();
  return query ? `/overview?${query}` : '/overview';
}

export default function OverviewPage() {
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
        <p>Loading overview...</p>
      </div>
    );
  }

  const metadata = data.metadata ?? {
    total_records: 0,
    countries: 0,
    occupations: 0
  };

  return (
    <div className="dashboard-layout">
      <Filters filters={filters} setFilters={setFilters} />

      <section className="page-content">
        <h1>Overview Analysis</h1>
        <p className="subtitle-small">
          Explore distributions of key mental health factors across demographic groups.
        </p>

        <div className="grid two">
          <div className="panel">
            <GroupedBarChart
              title="Treatment Seeking by Occupation"
              data={data.treatment_by_occupation ?? []}
              categories={['Yes', 'No']}
            />
          </div>

          <div className="panel">
            <GroupedBarChart
              title="Growing Stress by Occupation"
              data={data.stress_by_occupation ?? []}
              categories={['Yes', 'Maybe', 'No']}
            />
          </div>

          <div className="panel">
            <GroupedBarChart
              title="Mood Swings by Gender"
              data={data.mood_by_gender ?? []}
              categories={['Low', 'Medium', 'High']}
            />
          </div>

          <div className="panel">
            <GroupedBarChart
              title="Care Options by Top Countries"
              data={data.care_by_country ?? []}
              categories={['Yes', 'Not sure', 'No']}
            />
          </div>
        </div>
      </section>

      <aside className="insights">
        <h3>Dataset</h3>
        <p>
          <b>{metadata.total_records.toLocaleString()}</b> respondents
        </p>
        <p>{metadata.countries} countries</p>
        <p>{metadata.occupations} occupations</p>
      </aside>
    </div>
  );
}