'use client';

import { useState } from 'react';

type ModuleRow = {
  module_id: string;
  module_title: string;
  module_type: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  enabled: boolean;
  locked: boolean;
  planned_time_min: number;
};

export default function StructureEditor({ workshopId, initialSequence }: { workshopId: string; initialSequence: { modules: ModuleRow[]; cut_order: string[] } }) {
  const [sequence, setSequence] = useState(initialSequence);
  const [status, setStatus] = useState('');

  function updateModule(idx: number, patch: Partial<ModuleRow>) {
    const next = [...sequence.modules];
    next[idx] = { ...next[idx], ...patch };
    setSequence({ ...sequence, modules: next });
  }

  async function saveStructure() {
    setStatus('Saving...');
    const res = await fetch(`/api/workshops/${workshopId}/structure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequence })
    });
    setStatus(res.ok ? 'Structure saved.' : 'Failed to save structure.');
  }

  async function generateArtifacts() {
    setStatus('Generating artifacts...');
    const res = await fetch(`/api/workshops/${workshopId}/artifacts`, { method: 'POST' });
    setStatus(res.ok ? 'Artifacts generated. Refresh page.' : 'Failed to generate artifacts.');
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {sequence.modules.map((m, idx) => (
        <div key={m.module_id} style={{ border: '1px solid #ccc', padding: 8, background: '#fff' }}>
          <strong>{m.module_title}</strong> ({m.module_type})
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <label>
              Enabled
              <input type="checkbox" checked={m.enabled} onChange={(e) => updateModule(idx, { enabled: e.target.checked })} />
            </label>
            <label>
              Locked
              <input type="checkbox" checked={m.locked} onChange={(e) => updateModule(idx, { locked: e.target.checked })} />
            </label>
            <label>
              Time
              <input
                type="number"
                value={m.planned_time_min}
                min={1}
                onChange={(e) => updateModule(idx, { planned_time_min: Number(e.target.value) })}
              />
            </label>
            <label>
              Level
              <select value={m.level} onChange={(e) => updateModule(idx, { level: e.target.value as ModuleRow['level'] })}>
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
                <option value="professional">professional</option>
              </select>
            </label>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={saveStructure}>
          Save edited structure
        </button>
        <button type="button" onClick={generateArtifacts}>
          Regenerate manual + slides
        </button>
      </div>
      <small>{status}</small>
    </div>
  );
}
