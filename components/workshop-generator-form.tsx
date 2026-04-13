'use client';

import { AudienceLevel, ModuleTemplate, WorkshopTemplate } from '@prisma/client';
import { useMemo, useState } from 'react';

type Props = {
  template: WorkshopTemplate;
  modules: ModuleTemplate[];
};

type GenerationResponse = {
  structure: unknown;
  manual: { id: string; markdownBody: string };
  slides: { id: string; previewMarkdown: string };
};

export function WorkshopGeneratorForm({ template, modules }: Props) {
  const [title, setTitle] = useState(template.title);
  const [totalDurationMin, setTotalDurationMin] = useState(template.defaultDurationMin);
  const [groupSize, setGroupSize] = useState(8);
  const [numberOfTeachers, setNumberOfTeachers] = useState(1);
  const [stations, setStations] = useState('2 espresso stations, 1 milk station');
  const [targetLevel, setTargetLevel] = useState<AudienceLevel>('beginner');
  const [specialGoals, setSpecialGoals] = useState('Build ratio-first diagnosis confidence.');
  const [result, setResult] = useState<GenerationResponse | null>(null);

  const defaultMandatory = useMemo(
    () => modules.filter((m) => m.cutPriority <= 2).map((m) => m.id),
    [modules]
  );

  const generate = async () => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workshopTemplateId: template.id,
        title,
        totalDurationMin,
        groupSize,
        numberOfTeachers,
        stations,
        targetLevel,
        mandatoryModuleIds: defaultMandatory,
        optionalModuleIds: modules.map((m) => m.id).filter((id) => !defaultMandatory.includes(id)),
        specialGoals
      })
    });

    const data = (await res.json()) as GenerationResponse;
    setResult(data);
  };

  return (
    <>
      <div className="card">
        <h1>Coffee Habits Workshop Generator</h1>
        <p>Local-first curriculum and artifact generation prototype.</p>
      </div>

      <div className="card grid">
        <div>
          <label>Workshop title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        </div>
        <div>
          <label>Total duration (min)<input type="number" value={totalDurationMin} onChange={(e) => setTotalDurationMin(Number(e.target.value))} /></label>
        </div>
        <div>
          <label>Group size<input type="number" value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} /></label>
        </div>
        <div>
          <label>Teachers<input type="number" value={numberOfTeachers} onChange={(e) => setNumberOfTeachers(Number(e.target.value))} /></label>
        </div>
        <div>
          <label>Stations / equipment<input value={stations} onChange={(e) => setStations(e.target.value)} /></label>
        </div>
        <div>
          <label>Target level
            <select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value as AudienceLevel)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="professional">Professional</option>
            </select>
          </label>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label>Special goals<textarea value={specialGoals} onChange={(e) => setSpecialGoals(e.target.value)} rows={3} /></label>
        </div>
      </div>

      <div className="card"><button onClick={generate}>Generate structure + manual + slides</button></div>

      {result && (
        <>
          <div className="card">
            <h2>Workshop Structure JSON</h2>
            <pre>{JSON.stringify(result.structure, null, 2)}</pre>
          </div>
          <div className="card">
            <h2>Teacher Manual (Markdown)</h2>
            <pre>{result.manual.markdownBody}</pre>
          </div>
          <div className="card">
            <h2>Slide Preview (Markdown)</h2>
            <pre>{result.slides.previewMarkdown}</pre>
          </div>
        </>
      )}
    </>
  );
}
