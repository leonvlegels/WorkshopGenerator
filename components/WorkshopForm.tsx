'use client';

import { useState } from 'react';

type WorkshopTemplate = {
  id: string;
  title: string;
  default_duration_min: number;
};

export default function WorkshopForm({ templates }: { templates: WorkshopTemplate[] }) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [title, setTitle] = useState('Espresso Foundations for Beginners');
  const [duration, setDuration] = useState(120);
  const [groupSize, setGroupSize] = useState(10);
  const [teachers, setTeachers] = useState(1);
  const [equipment, setEquipment] = useState('2-group espresso machine + 2 grinders');
  const [level, setLevel] = useState('beginner');

  return (
    <form action="/api/generate" method="post" style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
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
        Target level
        <select name="audienceLevel" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="professional">Professional</option>
        </select>
      </label>
      <button type="submit">Generate structure + artifacts</button>
    </form>
  );
}
