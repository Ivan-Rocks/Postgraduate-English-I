import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const unitsDir = join(root, 'data', 'units');

const SCHEMA_VERSION = 2;
const LEVELS = new Set(['L1', 'L2', 'L3']);
const QUIZ_TYPES = new Set([
  'main-idea',
  'vocabulary-in-context',
  'reference',
  'logic-link',
  'detail',
  'inference',
  'attitude',
]);
const OUTPUT_KINDS = new Set(['sentence', 'scenario', 'rewrite']);
const TIME_PLAN_KEYS = new Set(['read', 'quiz', 'translation', 'output', 'vocab']);
const VOCAB_FIELDS = ['word', 'pos', 'gloss', 'collocation', 'example'];
const QUIZ_FIELDS = ['id', 'type', 'stem', 'options', 'answer', 'explanation'];
const TRANSLATION_FIELDS = ['id', 'source', 'reference'];
const OUTPUT_FIELDS = ['id', 'kind', 'targets', 'prompt'];

function fail(where, message) {
  throw new Error(`${where}: ${message}`);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function validateUnit(file, unit) {
  for (const field of ['schemaVersion', 'id', 'level', 'title', 'passage', 'vocab', 'quiz', 'translation', 'output']) {
    if (unit[field] == null) fail(file, `missing field "${field}"`);
  }
  if (unit.schemaVersion !== SCHEMA_VERSION) fail(file, `unsupported schemaVersion ${unit.schemaVersion}`);
  if (!LEVELS.has(unit.level)) fail(file, `unknown level "${unit.level}"`);
  if (!nonEmptyString(unit.passage)) fail(file, 'passage must be a non-empty string');

  if (unit.timeBudgetMin != null) {
    if (!Number.isInteger(unit.timeBudgetMin) || unit.timeBudgetMin < 1 || unit.timeBudgetMin > 120) {
      fail(file, 'timeBudgetMin must be an integer between 1 and 120');
    }
  }
  if (unit.timePlan != null) {
    if (typeof unit.timePlan !== 'object' || Array.isArray(unit.timePlan)) fail(file, 'timePlan must be an object');
    for (const [key, value] of Object.entries(unit.timePlan)) {
      if (!TIME_PLAN_KEYS.has(key)) fail(file, `timePlan has unknown key "${key}"`);
      if (!Number.isInteger(value) || value < 1) fail(file, `timePlan.${key} must be a positive integer`);
    }
  }

  if (!Array.isArray(unit.vocab) || unit.vocab.length === 0) fail(file, 'vocab must be a non-empty array');
  unit.vocab.forEach((v, i) => {
    for (const f of VOCAB_FIELDS) {
      if (!nonEmptyString(v[f])) fail(file, `vocab[${i}] missing "${f}"`);
    }
  });

  if (!Array.isArray(unit.quiz) || unit.quiz.length === 0) fail(file, 'quiz must be a non-empty array');
  unit.quiz.forEach((q, i) => {
    for (const f of QUIZ_FIELDS) {
      if (q[f] == null || q[f] === '') fail(file, `quiz[${i}] missing "${f}"`);
    }
    if (!QUIZ_TYPES.has(q.type)) fail(file, `quiz[${i}] unknown type "${q.type}"`);
    if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 5) {
      fail(file, `quiz[${i}] options must be 3-5 items`);
    }
    const keys = q.options.map((o) => o.key);
    if (new Set(keys).size !== keys.length) fail(file, `quiz[${i}] duplicate option keys`);
    for (const o of q.options) {
      if (o.key == null || o.text == null) fail(file, `quiz[${i}] option missing key/text`);
    }
    if (!keys.includes(q.answer)) fail(file, `quiz[${i}] answer "${q.answer}" not among options`);
  });

  validateTranslation(file, unit.translation);
  validateOutput(file, unit.output);
}

function validateTranslation(file, translation) {
  if (typeof translation !== 'object' || Array.isArray(translation)) fail(file, 'translation must be an object');
  if (!Array.isArray(translation.items) || translation.items.length === 0) {
    fail(file, 'translation.items must be a non-empty array');
  }
  translation.items.forEach((item, i) => {
    for (const f of TRANSLATION_FIELDS) {
      if (!nonEmptyString(item[f])) fail(file, `translation.items[${i}] missing "${f}"`);
    }
    if (item.points != null) {
      if (!Array.isArray(item.points) || item.points.some((p) => !nonEmptyString(p))) {
        fail(file, `translation.items[${i}].points must be an array of non-empty strings`);
      }
    }
  });
}

function validateOutput(file, output) {
  if (typeof output !== 'object' || Array.isArray(output)) fail(file, 'output must be an object');
  if (!Array.isArray(output.tasks) || output.tasks.length === 0) {
    fail(file, 'output.tasks must be a non-empty array');
  }
  output.tasks.forEach((task, i) => {
    for (const f of OUTPUT_FIELDS) {
      if (task[f] == null || task[f] === '') fail(file, `output.tasks[${i}] missing "${f}"`);
    }
    if (!OUTPUT_KINDS.has(task.kind)) fail(file, `output.tasks[${i}] unknown kind "${task.kind}"`);
    if (!Array.isArray(task.targets) || task.targets.length === 0 || task.targets.some((t) => !nonEmptyString(t))) {
      fail(file, `output.tasks[${i}].targets must be a non-empty array of non-empty strings`);
    }
    if (!nonEmptyString(task.prompt)) fail(file, `output.tasks[${i}].prompt must be a non-empty string`);
    if (task.hint != null && !nonEmptyString(task.hint)) fail(file, `output.tasks[${i}].hint must be a non-empty string`);
    if (task.reference != null && !nonEmptyString(task.reference)) fail(file, `output.tasks[${i}].reference must be a non-empty string`);
    if (task.checkpoints != null) {
      if (!Array.isArray(task.checkpoints) || task.checkpoints.some((p) => !nonEmptyString(p))) {
        fail(file, `output.tasks[${i}].checkpoints must be an array of non-empty strings`);
      }
    }
  });
}

const files = readdirSync(unitsDir).filter((f) => extname(f) === '.json');
if (files.length === 0) {
  console.error(`no unit files found in ${unitsDir}`);
  process.exit(1);
}

let vocabTotal = 0;
let quizTotal = 0;
let translationTotal = 0;
let outputTotal = 0;
for (const file of files.sort()) {
  const path = join(unitsDir, file);
  const unit = JSON.parse(readFileSync(path, 'utf8'));
  validateUnit(file, unit);
  vocabTotal += unit.vocab.length;
  quizTotal += unit.quiz.length;
  translationTotal += unit.translation.items.length;
  outputTotal += unit.output.tasks.length;
  console.log(`ok  ${file}  ${unit.level}  ${unit.vocab.length} vocab, ${unit.quiz.length} quiz, ${unit.translation.items.length} translation, ${unit.output.tasks.length} output  "${unit.title}"`);
}
console.log(`\n${files.length} unit(s), ${vocabTotal} vocab items, ${quizTotal} questions, ${translationTotal} translation items, ${outputTotal} output tasks.`);
