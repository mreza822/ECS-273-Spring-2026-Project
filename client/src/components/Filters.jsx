import React from 'react';

export default function Filters({ filters, setFilters }) {
  const update = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const reset = () => {
    setFilters({
      gender: 'All',
      occupation: 'All',
      country: 'All'
    });
  };

  return (
    <aside className="filters">
      <h3>Filters</h3>

      <label>Gender</label>
      <select
        value={filters.gender}
        onChange={e => update('gender', e.target.value)}
      >
        <option>All</option>
        <option>Female</option>
        <option>Male</option>
      </select>

      <label>Occupation</label>
      <select
        value={filters.occupation}
        onChange={e => update('occupation', e.target.value)}
      >
        <option>All</option>
        <option>Corporate</option>
        <option>Student</option>
        <option>Business</option>
        <option>Housewife</option>
        <option>Others</option>
      </select>

      <label>Country</label>
      <select
        value={filters.country}
        onChange={e => update('country', e.target.value)}
      >
        <option>All</option>
        <option>United States</option>
        <option>United Kingdom</option>
        <option>Canada</option>
        <option>Australia</option>
        <option>India</option>
      </select>

      <button className="reset" onClick={reset}>
        Reset Filters
      </button>
    </aside>
  );
}