import React from 'react';

export default function StatCard({ icon: Icon, num, label }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="icon-badge"><Icon /></div>
      </div>
      <div className="num">{num}</div>
      <div className="label">{label}</div>
    </div>
  );
}
