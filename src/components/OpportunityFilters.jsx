import React from 'react';
import SearchBar from './SearchBar';

export default function OpportunityFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  minMatch,
  onMinMatchChange,
  showMatchFilter = true,
}) {
  return (
    <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '2', minWidth: 'min(100%, 200px)' }}>
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search by title, company, or required skill..."
          />
        </div>

        <div style={{ flex: '1', minWidth: 'min(100%, 140px)' }}>
          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value="all">All Types (Jobs & Internships)</option>
            <option value="Internship">Internships Only</option>
            <option value="Job">Jobs Only</option>
          </select>
        </div>

        {showMatchFilter && (
          <div style={{ flex: '1', minWidth: 'min(100%, 140px)' }}>
            <select
              className="form-select"
              value={minMatch}
              onChange={(e) => onMinMatchChange(Number(e.target.value))}
            >
              <option value="0">All Match Scores</option>
              <option value="40">40%+ Skill Match</option>
              <option value="60">60%+ Skill Match</option>
              <option value="80">80%+ High Compatibility</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
