import nextEnv from '@next/env';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v2 as cloudinary } from 'cloudinary';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { projects, experience, credentialGroups } from '../components/porto-v2/detail-data.ts';

nextEnv.loadEnvConfig(process.cwd());
const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId || process.env.CONFIRM_FIREBASE_PROJECT !== projectId) {
  throw new Error('Set CONFIRM_FIREBASE_PROJECT to the exact FIREBASE_PROJECT_ID before seeding.');
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !(process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY)) {
  throw new Error('Firebase Admin credentials are required.');
}
const cloudUrl = new URL(process.env.CLOUDINARY_URL);
cloudinary.config({cloud_name: cloudUrl.hostname, api_key: decodeURIComponent(cloudUrl.username), api_secret: decodeURIComponent(cloudUrl.password), secure: true});
const app = getApps()[0] ?? initializeApp({projectId, credential: applicationDefault()});
const db = getFirestore(app);
const source = 'porto-v2-2026-11-13';
const root = path.join(process.cwd(), 'public', 'porto-v2');
const folder = `${(process.env.CLOUDINARY_FOLDER_ROOT || 'portfolio').replace(/\/$/, '')}/porto-v2`;
const assets = [
  'aisnet-artwork.png', 'aisnet-icon.png', 'ayawarta-logo.png', 'digitak-logo.svg',
  'itg-logo.png', 'puru-logo.svg', 'reyy-home.png', 'reyy-icon.png',
  'sakode-home.png', 'sakode-logo.png', 'yoga-portrait.png', 'yogaaa-mark.png',
];
const cleanId = (file) => file.replace(/\.[^.]+$/, '');
const urls = {};
for (const file of assets) {
  const bytes = await readFile(path.join(root, file));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const id = cleanId(file);
  const ref = db.collection('mediaAssets').doc(id);
  const existing = await ref.get();
  if (existing.exists) {
    const data = existing.data();
    if (data.source !== source || data.sha256 !== sha256 || !data.secureUrl) throw new Error(`Existing media asset ${id} differs from approved seed.`);
    urls[`/porto-v2/${file}`] = data.secureUrl;
    console.log(`media retained: ${id}`);
    continue;
  }
  const upload = await cloudinary.uploader.upload(path.join(root, file), {
    public_id: `${folder}/${id}-${sha256.slice(0, 12)}`, overwrite: false,
    resource_type: 'image', type: 'upload', tags: ['porto-v2', 'portfolio-seed'],
  });
  const data = {source, filename: file, sha256, publicId: upload.public_id, assetId: upload.asset_id,
    secureUrl: upload.secure_url, format: upload.format, width: upload.width, height: upload.height,
    bytes: upload.bytes, status: 'ready', visibility: 'public', createdAt: new Date()};
  await ref.create(data);
  urls[`/porto-v2/${file}`] = data.secureUrl;
  console.log(`media registered: ${id}`);
}

async function create(collection, id, data) {
  const ref = db.collection(collection).doc(id);
  const existing = await ref.get();
  if (existing.exists) {
    if (existing.data().source !== source) throw new Error(`Existing ${collection}/${id} was not created by this seed.`);
    console.log(`retained: ${collection}/${id}`);
    return;
  }
  await ref.create({ ...data, source, createdAt: new Date(), updatedAt: new Date() });
  console.log(`created: ${collection}/${id}`);
}
const media = (value) => urls[value] ?? value;
for (const [order, project] of projects.entries()) {
  const content = { ...project, visual: media(project.visual), order, projectPhase: 'completed',
    publicationStatus: 'published', isFeatured: true, featuredOrder: order };
  await create('projects', project.slug, {slug: project.slug, title: project.title,
    status: 'published', published: content, draft: content, revision: 1, publishedAt: new Date()});
  await create('slugReservations', `project_${project.slug}`, {kind: 'project', slug: project.slug, ownerId: project.slug});
}
for (const [order, item] of experience.entries()) {
  await create('experiences', ['itg', 'puru', 'sakode', 'ayawarta', 'digitak'][order],
    { ...item, image: media(item.image), order, status: 'published' });
}
await create('education', 'itg-2022-2026', {institution: 'Institut Teknologi Garut',
  program: 'S1 Teknik Informatika', degree: 'Sarjana Komputer / Bachelor of Computer Science',
  focus: ['Software Engineering', 'Intelligent System'], startYear: 2022, endYear: 2026,
  gpa: '3.95', order: 0, status: 'published'});
let credentialOrder = 0;
for (const group of credentialGroups) for (const [title, issuer, href] of group.items) {
  const id = `credential-${String(++credentialOrder).padStart(2, '0')}`;
  await create('credentials', id, {title, issuer, href, group: group.label, order: credentialOrder, status: 'published'});
}
await create('site', 'settings', {name: 'Yoga Agustiansyah', role: 'Software Developer & AI Explorer',
  headline: 'I build software, explore computer vision, and turn complex ideas into useful experiences.',
  email: 'yogaaa.koneksi@gmail.com', instagram: 'https://www.instagram.com/yoga0_120/',
  linkedin: 'https://www.linkedin.com/in/yoga-agustiansyah/',
  portraitUrl: media('/porto-v2/yoga-portrait.png'), brandMarkUrl: media('/porto-v2/yogaaa-mark.png'),
  completedProjectsCount: 6, teamsAndClientsCount: 7});
await create('site', 'theme', {light: {background: '#f4efe7', foreground: '#171a1c', accent: '#8f493e'},
  dark: {background: '#1d1e1d', foreground: '#f2e9dc', accent: '#c49869'}});
await create('profile', 'main', {name: 'Yoga Agustiansyah', bio: 'Software developer working across frontend, mobile, and the systems around them.',
  portraitUrl: media('/porto-v2/yoga-portrait.png')});
await create('thoughts', 'the-interface-is-part-of-the-work', {title: 'The interface is part of the work.',
  slug: 'the-interface-is-part-of-the-work', status: 'draft', published: null, revision: 1,
  draft: {title: 'The interface is part of the work.', summary: 'Frontend, UI decisions, AI agents, and the work around a feature.',
    coverUrl: media('/porto-v2/sakode-home.png'), bodyMarkdown: 'A screen is a decision.\n\nBefore the first line of code, map the people, flow, and risks around the feature.\n\nWork with AI deliberately and review the outcome.'}});
const research = {slug: 'privacy-preserving-fall-detection', title: 'Privacy-preserving fall detection.',
  category: 'Academic thesis / computer vision', summary: 'An academic exploration of fall detection that treats visual privacy as part of the research question.',
  rows: [['The question', 'How might a visual system recognize falls while limiting what it reveals about a person?'],
    ['The context', 'This is a thesis project, separate from my client and workplace deliveries.'],
    ['The record', 'Methods, evaluation, and conclusions will be documented here when this material is ready for publication.']]};
await create('research', research.slug, {slug: research.slug, title: research.title, status: 'published',
  published: research, draft: research, revision: 1, publishedAt: new Date()});
await create('slugReservations', `research_${research.slug}`, {kind: 'research', slug: research.slug, ownerId: research.slug});
await create('pages', 'homepage', {headline: 'YOGA AGUSTIANSYAH.', workHeading: "What I've built.",
  experienceHeading: 'The teams behind the work.', learningHeading: "What I'm learning now.",
  learning: [
    {label: 'UI/UX DESIGN', title: 'Designing for people.', body: "I often build interfaces without a finished design. I'm studying usability, information hierarchy, and interaction design so the features I deliver feel clear and comfortable to use."},
    {label: 'AI AGENTS & ORCHESTRATION', title: 'Directing AI systems.', body: "I'm moving beyond chat-based coding help to learn agent design, orchestration, controls, and MCP—and how to make AI assistance useful in real workflows."},
    {label: 'SYSTEM ANALYSIS', title: 'Seeing the whole system.', body: "I'm learning to map requirements, system flows, and security risks before implementation, then guide and review the work AI helps produce."}],
  nextUp: {title: 'DevOps & server operations.', body: 'I plan to learn deployment, server management, and maintenance so I understand what happens after a product ships.'}});
console.log(JSON.stringify({done: true, projectId, projects: projects.length, experiences: experience.length,
  credentials: credentialOrder, assets: assets.length}));
