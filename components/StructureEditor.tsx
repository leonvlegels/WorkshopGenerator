'use client';

import { useState } from 'react';

export default function StructureEditor({ workshopId, initial }: { workshopId: string; initial: any }) {
  const [value, setValue] = useState(JSON.stringify({ modules: initial.modules, cut_order: initial.cut_order }, null, 2));
  const [status, setStatus] = useState<string>('');

  async function save() {
    setStatus('Saving...');
    const parsed = JSON.parse(value);
    const res = await fetch(`/api/workshops/${workshopId}/structure`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    });
    setStatus(res.ok ? 'Saved.' : 'Save failed.');
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <p>Edit sequence JSON (order, timing, level, must/optional points) before regenerating artifacts.</p>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={20} style={{ fontFamily: 'monospace', width: '100%' }} />
      <div>
        <button type="button" onClick={save}>
          Save structure edits
        </button>{' '}
        <span>{status}</span>
      </div>
    </div>
  );
}
