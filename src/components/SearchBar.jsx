import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search by keyword...' }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)'
        }}
      />
      <input
        type="text"
        className="form-input"
        style={{ paddingLeft: '38px' }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
