// src/components/ErrorMessage.jsx
import React from 'react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚠️</span>
        <span>{message || 'Something went wrong.'}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm btn-outline" style={{ marginTop: '4px' }}>
          Try Again
        </button>
      )}
    </div>
  );
}
