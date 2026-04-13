'use client';

import { useState } from 'react';

type Expansion = { id: string; requested_topic_text: string; status: string };

export default function ExpansionBoard({ items }: { items: Expansion[] }) {
  const [status, setStatus] = useState('');

  async function advance(id: string) {
    setStatus(`Advancing ${id}...`);
    const res = await fetch(`/api/expansion/${id}/advance`, { method: 'POST' });
    setStatus(res.ok ? 'Advanced expansion request. Refresh page to see status updates.' : 'Failed to advance expansion request.');
  }

  return (
    <div>
      <ul>
        {items.map((e) => (
          <li key={e.id}>
            {e.requested_topic_text} ({e.status}){' '}
            <button type="button" onClick={() => advance(e.id)}>
              Create draft knowledge + provisional module
            </button>
          </li>
        ))}
      </ul>
      <small>{status}</small>
    </div>
  );
}
