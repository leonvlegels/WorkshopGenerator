import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const entity = String(form.get('entity') ?? '');
  const action = String(form.get('action') ?? 'create');

  if (action === 'delete') {
    const id = String(form.get('id') ?? '');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const deleters: Record<string, () => Promise<unknown>> = {
      topic: () => prisma.topic.delete({ where: { id } }),
      source: () => prisma.source.delete({ where: { id } }),
      claim: () => prisma.claim.delete({ where: { id } }),
      canonical_entry: () => prisma.canonicalEntry.delete({ where: { id } }),
      teaching_view: () => prisma.teachingView.delete({ where: { id } }),
      module_template: () => prisma.moduleTemplate.delete({ where: { id } }),
      workshop_template: () => prisma.workshopTemplate.delete({ where: { id } }),
      feedback_note: () => prisma.feedbackNote.delete({ where: { id } })
    };

    if (!deleters[entity]) return NextResponse.json({ error: 'Unsupported entity' }, { status: 400 });
    await deleters[entity]();
    return NextResponse.redirect(new URL('/curriculum', req.url));
  }

  if (entity === 'topic') {
    await prisma.topic.create({
      data: {
        slug: String(form.get('slug')),
        display_name: String(form.get('display_name')),
        brew_method: String(form.get('brew_method')),
        equipment_context: String(form.get('equipment_context')),
        canonical_status: 'draft'
      }
    });
  } else if (entity === 'source') {
    await prisma.source.create({
      data: {
        title: String(form.get('title')),
        source_type: String(form.get('source_type')) as any,
        author_or_org: String(form.get('author_or_org')),
        citation_text: String(form.get('citation_text')),
        url_or_local_ref: String(form.get('url_or_local_ref')),
        source_quality_tier: String(form.get('source_quality_tier')) as any
      }
    });
  } else if (entity === 'claim') {
    await prisma.claim.create({
      data: {
        topic_id: String(form.get('topic_id')),
        text: String(form.get('text')),
        claim_strength: String(form.get('claim_strength')) as any,
        evidence_status: String(form.get('evidence_status')) as any,
        consensus_scope: String(form.get('consensus_scope')) as any
      }
    });
  } else if (entity === 'canonical_entry') {
    await prisma.canonicalEntry.create({
      data: {
        topic_id: String(form.get('topic_id')),
        canonical_text: String(form.get('canonical_text')),
        tradeoff_summary: String(form.get('tradeoff_summary')),
        ambiguity_notes: [String(form.get('ambiguity_notes') ?? '')],
        allowed_simplifications: [],
        common_misconceptions: [],
        version: 1
      }
    });
  } else if (entity === 'teaching_view') {
    await prisma.teachingView.create({
      data: {
        topic_id: String(form.get('topic_id')),
        audience_level: String(form.get('audience_level')) as any,
        summary_text: String(form.get('summary_text')),
        must_include_points: [String(form.get('must_include_points') ?? '')],
        optional_depth_points: [],
        avoid_overstatement_points: [],
        tradeoff_table: {},
        example_phrasings: []
      }
    });
  } else if (entity === 'module_template') {
    await prisma.moduleTemplate.create({
      data: {
        topic_id: String(form.get('topic_id')),
        module_type: String(form.get('module_type')) as any,
        title: String(form.get('title')),
        objective: String(form.get('objective')),
        canonical_core_ref: String(form.get('canonical_core_ref')),
        default_sequence_order: Number(form.get('default_sequence_order') ?? 1),
        min_time_min: Number(form.get('min_time_min') ?? 5),
        ideal_time_min: Number(form.get('ideal_time_min') ?? 10),
        expandable_time_min: Number(form.get('expandable_time_min') ?? 15),
        cut_priority: Number(form.get('cut_priority') ?? 1),
        prerequisites: [],
        suitable_levels: ['beginner', 'intermediate'],
        must_cover_points: [String(form.get('must_cover_points') ?? '')],
        optional_points: [],
        if_running_late: [],
        if_extra_time: [],
        practical_component: String(form.get('practical_component') ?? 'n/a'),
        slide_needs: String(form.get('slide_needs') ?? 'n/a'),
        visual_needs: String(form.get('visual_needs') ?? 'n/a'),
        recap_prompt: String(form.get('recap_prompt') ?? 'n/a'),
        qna_hooks: String(form.get('qna_hooks') ?? 'n/a'),
        workshop_phase: String(form.get('workshop_phase') ?? 'slide_heavy') as any,
        status: 'draft'
      }
    });
  } else if (entity === 'workshop_template') {
    await prisma.workshopTemplate.create({
      data: {
        slug: String(form.get('slug')),
        title: String(form.get('title')),
        description: String(form.get('description')),
        default_duration_min: Number(form.get('default_duration_min') ?? 120),
        intended_audience_range: String(form.get('intended_audience_range')),
        module_sequence: [],
        mandatory_modules: [],
        optional_modules: [],
        pacing_notes: String(form.get('pacing_notes') ?? ''),
        status: 'draft'
      }
    });
  } else if (entity === 'feedback_note') {
    await prisma.feedbackNote.create({
      data: {
        scope_type: String(form.get('scope_type')) as any,
        scope_ref_id: String(form.get('scope_ref_id')),
        note_text: String(form.get('note_text')),
        priority: Number(form.get('priority') ?? 3),
        active: true
      }
    });
  }

  return NextResponse.redirect(new URL('/curriculum', req.url));
}
