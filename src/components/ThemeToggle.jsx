// src/components/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
      }}
    >
      {theme === 'light' ? '다크모드' : '라이트모드'}
    </button>
  );
};

export default ThemeToggle;