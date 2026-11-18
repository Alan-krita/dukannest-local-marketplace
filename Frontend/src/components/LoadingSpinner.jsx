// src/components/LoadingSpinner.jsx
import React from 'react';

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-wrapper">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function LoadingInline({ text = 'Loading...' }) {
  return (
    <span className="loading-inline">
      <span className="spinner spinner-sm" />
      {text}
    </span>
  );
}

export default LoadingSpinner;
