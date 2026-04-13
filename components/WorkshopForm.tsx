'use client';

import { useMemo, useState } from 'react';

type WorkshopTemplate = {
  id: string;
  title: string;
  default_duration_min: number;
  module_sequence: string[];
};

type ModuleTemplate = {
  id: string;
  title: string;
  module_type: string;
  topic_id: string;
  suitable_levels: string[];
};

type ModulePick = {
  moduleId: string;
  enabled: boolean;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  locked: boolean;
  plannedTimeMin?: number;
};

export default function WorkshopForm({ templates, modules }: { templates: WorkshopTemplate[]; modules: ModuleTemplate[] }) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [title, setTitle] = useState('Espresso Foundations for Beginners');
  const [duration, setDuration] = useState(120);
  const [groupSize, setGroupSize] = useState(10);
  const [teachers, setTeachers] = useState(1);
  const [equipment, setEquipment] = useState('2-group espresso machine + 2 grinders');
  const [specialGoals, setSpecialGoals] = useState('Build stable dial-in language and taste diagnosis habits.');

  const template = useMemo(() => templates.find((t) => t.id === templateId), [templateId, templates]);

  const [modulePicks, setModulePicks] = useState<ModulePick[]>(
    modules.map((m) => ({ moduleId: m.id, enabled: true, level: 'beginner', locked: false }))
  );

  const templateSet = useMemo(() => new Set((template?.module_sequence ?? []).map(String)), [template]);

  function patchPick(moduleId: string, patch: Partial<ModulePick>) {
    setModulePicks((prev) => prev.map((p) => (p.moduleId === moduleId ? { ...p, ...patch } : p)));
  }

  return (
    <form action="/api/generate" method="post" style={{ display: 'grid', gap: 12, maxWidth: 800 }}>
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
      <label>
        Special goals
        <textarea name="specialGoals" value={specialGoals} onChange={(e) => setSpecialGoals(e.target.value)} />
      </label>

      <h3>Module selection + per-module level</h3>
      {modules.map((m) => {
        const pick = modulePicks.find((p) => p.moduleId === m.id)!;
        return (
          <div key={m.id} style={{ background: templateSet.has(m.id) ? '#eef6ff' : '#fff', border: '1px solid #ddd', padding: 8 }}>
            <strong>{m.title}</strong> ({m.module_type})
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <label>
                Enabled
                <input type="checkbox" checked={pick.enabled} onChange={(e) => patchPick(m.id, { enabled: e.target.checked })} />
              </label>
              <label>
                Locked
                <input type="checkbox" checked={pick.locked} onChange={(e) => patchPick(m.id, { locked: e.target.checked })} />
              </label>
              <label>
                Level
                <select value={pick.level} onChange={(e) => patchPick(m.id, { level: e.target.value as ModulePick['level'] })}>
                  <option value="beginner">beginner</option>
                  <option value="intermediate">intermediate</option>
                  <option value="advanced">advanced</option>
                  <option value="professional">professional</option>
                </select>
              </label>
              <label>
                Planned min
                <input
                  type="number"
                  min={1}
                  value={pick.plannedTimeMin ?? ''}
                  onChange={(e) => patchPick(m.id, { plannedTimeMin: e.target.value ? Number(e.target.value) : undefined })}
                />
              </label>
            </div>
          </div>
        );
      })}

      <input type="hidden" name="moduleSelections" value={JSON.stringify(modulePicks)} />
      <button type="submit">Generate structure</button>
    </form>
  );
}
