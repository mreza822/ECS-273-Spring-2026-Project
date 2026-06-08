import React, { useEffect, useState } from 'react';
import { fetchJson } from '../utils/api.js';
import Filters from '../components/Filters.jsx';
import ClusterScatter from '../components/ClusterScatter.jsx';

function buildQuery(filters) {
  const params = new URLSearchParams();

  if (filters.gender !== 'All') params.append('gender', filters.gender);
  if (filters.occupation !== 'All') params.append('occupation', filters.occupation);
  if (filters.country !== 'All') params.append('country', filters.country);

  const query = params.toString();
  return query ? `/clusters?${query}` : '/clusters';
}

export default function ClusterPage() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    gender: 'All',
    occupation: 'All',
    country: 'All'
  });
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);

    fetchJson(buildQuery(filters))
      .then(result => {
        setData(result);
        setSelected(null);
      })
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
        <p>Loading clusters...</p>
      </div>
    );
  }

  const summaries = data.summaries ?? [];
  const selectedSummary =
    summaries.find(d => d.cluster === selected) ??
    summaries[0] ??
    null;

  return (
    <div className="dashboard-layout">
      <Filters filters={filters} setFilters={setFilters} />

      <section className="page-content">
        <h1>Cluster Analysis</h1>
        <p className="subtitle-small">
          PCA-style projection of encoded survey responses colored by respondent cluster.
        </p>

        <div className="cluster-row">
          <div className="panel">
            <ClusterScatter data={data} onSelect={setSelected} />
          </div>

          <div className="panel summary">
            <h3>Cluster Summary</h3>

            {summaries.length === 0 ? (
              <p>No cluster records match the selected filters.</p>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Cluster</th>
                      <th>Size</th>
                      <th>%</th>
                      <th>Treatment</th>
                      <th>Coping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map(s => (
                      <tr
                        key={s.cluster}
                        onClick={() => setSelected(s.cluster)}
                        className={selected === s.cluster ? 'selected' : ''}
                      >
                        <td>{s.cluster}</td>
                        <td>{s.size}</td>
                        <td>{s.percentage}%</td>
                        <td>{s.treatment_rate}%</td>
                        <td>{s.coping_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {selectedSummary && (
                  <>
                    <h3>Selected Cluster {selectedSummary.cluster}</h3>
                    <p>
                      Top occupation: <b>{selectedSummary.top_occupation}</b>
                    </p>
                    <p>
                      Dominant stress: <b>{selectedSummary.dominant_stress}</b>
                    </p>
                    <p>
                      Dominant mood: <b>{selectedSummary.dominant_mood}</b>
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}