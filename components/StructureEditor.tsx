'use client';

import { useState } from 'react';

type ModuleRow = {
  module_id: string;
  module_title: string;
  module_type: string;
  workshop_phase: string;
  locked: boolean;
  planned_time_min: number;
  cut_priority: number;
  audience_level: string;
};

export default function StructureEditor({ workshopId, initialModules }: { workshopId: string; initialModules: ModuleRow[] }) {
  const [rows, setRows] = useState(initialModules);
  const [status, setStatus] = useState('');

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...rows];
    const target = idx + dir;
    if (target < 0 || target >= rows.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setRows(next);
  };

  const save = async () => {
    setStatus('Saving...');
    const res = await fetch(`/api/workshops/${workshopId}/structure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules: rows })
    });
    setStatus(res.ok ? 'Saved structure.' : 'Save failed.');
  };

  const regenerate = async () => {
    setStatus('Regenerating artifacts...');
    const res = await fetch(`/api/workshops/${workshopId}/regenerate`, { method: 'POST' });
    setStatus(res.ok ? 'Regenerated. Refresh to view latest artifacts.' : 'Regenerate failed.');
  };

  return (
    <div>
      {rows.map((row, idx) => (
        <div key={row.module_id} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 130px 100px 140px 120px', gap: 8, marginBottom: 8 }}>
          <span>{row.module_title}</span>
          <input
            type="number"
            value={row.planned_time_min}
            onChange={(e) => {
              const v = Number(e.target.value);
              setRows((prev) => prev.map((p, i) => (i === idx ? { ...p, planned_time_min: v } : p)));
            }}
          />
          <select
            value={row.workshop_phase}
            onChange={(e) => setRows((prev) => prev.map((p, i) => (i === idx ? { ...p, workshop_phase: e.target.value } : p)))}
          >
            <option value="slide-heavy">slide-heavy</option>
            <option value="hands-on">hands-on</option>
            <option value="recap">recap</option>
          </select>
          <select
            value={row.audience_level}
            onChange={(e) => setRows((prev) => prev.map((p, i) => (i === idx ? { ...p, audience_level: e.target.value } : p)))}
          >
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
            <option value="professional">professional</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={row.locked}
              onChange={(e) => setRows((prev) => prev.map((p, i) => (i === idx ? { ...p, locked: e.target.checked } : p)))}
            />
            locked
          </label>
          <div>
            <button type="button" onClick={() => move(idx, -1)}>
              ↑
            </button>
            <button type="button" onClick={() => move(idx, 1)}>
              ↓
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={save}>
        Save edited structure
      </button>{' '}
      <button type="button" onClick={regenerate}>
        Regenerate manual + slides from saved structure
      </button>
      <p>{status}</p>
    </div>
  );
}
