import React from 'react';

export default function Badge({ status }) {
  const cls = (status || '').toLowerCase();
  return <span className={`badge ${cls}`}>{status}</span>;
}
