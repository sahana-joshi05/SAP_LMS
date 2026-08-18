import React from 'react';

export default function PageHeader({ title, subtitle, cta }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {cta}
    </div>
  );
}
