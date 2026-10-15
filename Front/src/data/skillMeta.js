// RPG flavour for the skills inventory. Keyed by the skill name from the API (case-insensitive).
// Skills missing here still show up as "common" items without a proficiency bar.
//   rarity: common | rare | epic | legendary
//   level:  0–100 (proficiency bar)
//   flavor: optional item description, per language
// These values are placeholders — adjust them to how you see your own stack.
const skillMeta = {
  react: {
    rarity: 'legendary',
    level: 85,
    flavor: { en: 'Re-renders reality on every state change.', pt: 'Volta a renderizar a realidade a cada mudança de estado.' },
  },
  javascript: {
    rarity: 'legendary',
    level: 85,
    flavor: { en: "Ancient, chaotic, and somehow everywhere. '1' + 1 === '11'.", pt: "Antigo, caótico e, de alguma forma, em todo o lado. '1' + 1 === '11'." },
  },
  typescript: {
    rarity: 'epic',
    level: 75,
    flavor: { en: 'JavaScript wearing armour. Blocks 90% of runtime surprises.', pt: 'JavaScript de armadura. Bloqueia 90% das surpresas em runtime.' },
  },
  flutter: {
    rarity: 'epic',
    level: 70,
    flavor: { en: 'One codebase, every screen.', pt: 'Uma base de código, todos os ecrãs.' },
  },
  dart: { rarity: 'rare', level: 65 },
  'sass/scss': {
    rarity: 'rare',
    level: 80,
    flavor: { en: 'CSS with a utility belt.', pt: 'CSS com cinto de ferramentas.' },
  },
  'node.js': {
    rarity: 'epic',
    level: 75,
    flavor: { en: 'Lets JavaScript leave the browser and get a job on the server.', pt: 'Deixa o JavaScript sair do browser e arranjar emprego no servidor.' },
  },
  python: { rarity: 'rare', level: 60 },
  git: {
    rarity: 'epic',
    level: 80,
    flavor: { en: 'Save points for code. Never leave home without it.', pt: 'Save points para código. Nunca saias de casa sem ele.' },
  },
  postgresql: { rarity: 'rare', level: 65 },
  'sql lite': { rarity: 'common', level: 60 },
  mysql: { rarity: 'rare', level: 65 },
  docker: {
    rarity: 'rare',
    level: 60,
    flavor: { en: '"Works on my machine" — now shippable.', pt: '"Na minha máquina funciona" — agora em contentor.' },
  },
  'vs code': { rarity: 'common', level: 90 },
  caprover: { rarity: 'common', level: 55 },
  unity: {
    rarity: 'rare',
    level: 55,
    flavor: { en: 'Where the gaming side quest began.', pt: 'Onde começou a side quest dos videojogos.' },
  },
  chatgpt: { rarity: 'common', level: 80 },
  claude: { rarity: 'common', level: 80 },
  'github copilot': { rarity: 'common', level: 75 },
  gemini: { rarity: 'common', level: 70 },
  dokie: { rarity: 'common', level: 60 },
}

export const getSkillMeta = (name = '') => skillMeta[name.trim().toLowerCase()] || { rarity: 'common' }

export default skillMeta
