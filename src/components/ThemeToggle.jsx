import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ showLabel = false, style = {} }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={`Switch to ${isDark ? 'Light Theme (Orange & White)' : 'Dark Theme (Golden & Black)'}`}
      aria-label="Toggle visual theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        borderRadius: showLabel ? '9999px' : '50%',
        padding: showLabel ? '6px 14px' : '8px',
        ...style,
      }}
    >
      {isDark ? (
        <Sun size={18} style={{ color: '#eab308' }} />
      ) : (
        <Moon size={18} style={{ color: '#ea580c' }} />
      )}
      {showLabel && (
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {isDark ? 'Lite Theme' : 'Dark Theme'}
        </span>
      )}
    </button>
  );
}
