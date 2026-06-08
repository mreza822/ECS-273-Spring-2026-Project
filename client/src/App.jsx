import React, { useState } from 'react';
import Home from './pages/Home.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import RelationshipPage from './pages/RelationshipPage.jsx';
import ClusterPage from './pages/ClusterPage.jsx';

const pages = {
  home: Home,
  overview: OverviewPage,
  relationships: RelationshipPage,
  clusters: ClusterPage,
};

export default function App() {
  const [page, setPage] = useState('home');
  const Page = pages[page];

  return (
    <div className="app">
      <nav className="topbar">
        <div className="brand" onClick={() => setPage('home')}>Mental Health Visual Analytics</div>
        <button className={page === 'overview' ? 'active' : ''} onClick={() => setPage('overview')}>Overview</button>
        <button className={page === 'relationships' ? 'active' : ''} onClick={() => setPage('relationships')}>Relationships</button>
        <button className={page === 'clusters' ? 'active' : ''} onClick={() => setPage('clusters')}>Clusters</button>
      </nav>
      <main>
        <Page navigate={setPage} />
      </main>
    </div>
  );
}
