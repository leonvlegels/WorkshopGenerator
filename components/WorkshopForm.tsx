'use client';

import { useMemo, useState } from 'react';

type WorkshopTemplate = {
  id: string;
  title: string;
  default_duration_min: number;
};

type Module = {
  id: string;
  title: string;
  module_type: string;
  default_sequence_order: number;
  suitable_levels: unknown;
  topic: { display_name: string };
};

const ALL_LEVELS = ['beginner', 'intermediate', 'advanced', 'professional'] as const;

export default function WorkshopForm({ templates, modules }: { templates: WorkshopTemplate[]; modules: Module[] }) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [title, setTitle] = useState('Espresso Foundations for Beginners');
  const [duration, setDuration] = useState(120);
  const [groupSize, setGroupSize] = useState(10);
  const [teachers, setTeachers] = useState(1);
  const [equipment, setEquipment] = useState('2-group espresso machine + 2 grinders');

  const initialSelection = useMemo(
    () =>
      modules.map((m) => ({
        moduleId: m.id,
        enabled: true,
        locked: false,
        level: 'beginner'
      })),
    [modules]
  );

  const [selection, setSelection] = useState(initialSelection);

  return (
    <form action="/api/generate" method="post" style={{ display: 'grid', gap: 12, maxWidth: 880 }}>
      <label>
        Workshop template
        <select name="workshopTemplateId" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Workshop title
        <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Total duration (min)
        <input name="totalDurationMin" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
      </label>
      <label>
        Group size
        <input name="groupSize" type="number" value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} required />
      </label>
      <label>
        Number of teachers
        <input name="teachers" type="number" value={teachers} onChange={(e) => setTeachers(Number(e.target.value))} required />
      </label>
      <label>
        Equipment context
        <input name="equipmentContext" value={equipment} onChange={(e) => setEquipment(e.target.value)} required />
      </label>

      <h3>Module selection and per-module level</h3>
      <div style={{ display: 'grid', gap: 8, border: '1px solid #ccc', padding: 12, background: '#fff' }}>
        {modules.map((m, idx) => (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, alignItems: 'center' }}>
            <label>
              <input
                type="checkbox"
                checked={selection[idx]?.enabled ?? false}
                onChange={(e) => {
                  const next = [...selection];
                  next[idx] = { ...next[idx], enabled: e.target.checked };
                  setSelection(next);
                }}
              />{' '}
              {m.default_sequence_order}. {m.title} ({m.module_type}) — {m.topic.display_name}
            </label>
            <label>
              Level
              <select
                value={selection[idx]?.level ?? 'beginner'}
                onChange={(e) => {
                  const next = [...selection];
                  next[idx] = { ...next[idx], level: e.target.value };
                  setSelection(next);
                }}
              >
                {ALL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Lock order
              <input
                type="checkbox"
                checked={selection[idx]?.locked ?? false}
                onChange={(e) => {
                  const next = [...selection];
                  next[idx] = { ...next[idx], locked: e.target.checked };
                  setSelection(next);
                }}
              />
            </label>
            <div>
              Suitable levels: {Array.isArray(m.suitable_levels) ? m.suitable_levels.join(', ') : 'all'}
            </div>
          </div>
        ))}
      </div>

      <input type="hidden" name="selectedModules" value={JSON.stringify(selection)} />
      <button type="submit">Generate editable structure</button>
    </form>
  );
}
