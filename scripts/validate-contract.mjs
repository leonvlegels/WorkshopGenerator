import fs from 'node:fs';

const generation = fs.readFileSync('lib/generation.ts', 'utf8');
const reviewRoute = fs.readFileSync('app/api/review/route.ts', 'utf8');
const expansionManage = fs.readFileSync('app/api/expansion/manage/route.ts', 'utf8');

function expect(cond, message) {
  if (!cond) throw new Error(message);
}

expect(generation.includes('missing_input_assumptions'), 'Assumption log keys missing');
expect(generation.includes('buildWorkshopSequence'), 'Workshop structure generation helper missing');
expect(generation.includes('buildSlideModel'), 'Slide model helper missing');
expect(reviewRoute.includes('workshopStructure.update'), 'Review persistence into structure missing');
expect(expansionManage.includes('create_draft_knowledge'), 'Expansion draft-knowledge step missing');
expect(expansionManage.includes('create_provisional_module'), 'Expansion provisional module step missing');

console.log('Validation checks passed.');
