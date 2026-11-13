import nextEnv from '@next/env';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

nextEnv.loadEnvConfig(process.cwd());
const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId || process.env.CONFIRM_FIREBASE_PROJECT !== projectId) {
  throw new Error('Set CONFIRM_FIREBASE_PROJECT to the exact FIREBASE_PROJECT_ID before verification.');
}
const app = getApps()[0] ?? initializeApp({projectId, credential: applicationDefault()});
const db = getFirestore(app);
const collection = async name => (await db.collection(name).get()).docs.map(doc => ({id: doc.id, ...doc.data()}));
const [projects, experiences, education, credentials, media, thoughts, research, pages] = await Promise.all([
  collection('projects'), collection('experiences'), collection('education'), collection('credentials'),
  collection('mediaAssets'), collection('thoughts'), collection('research'), collection('pages'),
]);
const site = await db.collection('site').doc('settings').get();
const assert = (condition, message) => {if (!condition) throw new Error(message);};
assert(site.exists, 'Missing site settings.');
assert(projects.length >= 3, 'Expected three featured projects.');
assert(experiences.length >= 5, 'Expected five experience records.');
assert(education.length >= 1, 'Expected education.');
assert(credentials.length >= 28, 'Expected 28 credentials.');
assert(media.length >= 12, 'Expected 12 registered Cloudinary assets.');
assert(pages.some(page => page.id === 'homepage'), 'Missing homepage section copy.');
assert(thoughts.some(item => item.id === 'the-interface-is-part-of-the-work' && item.status === 'draft' && !item.published), 'Sample thought must remain a private draft.');
assert(research.some(item => item.id === 'privacy-preserving-fall-detection' && item.status === 'published'), 'Missing public research record.');
const urls = new Set(media.map(item => item.secureUrl));
assert(media.every(item => item.status === 'ready' && item.secureUrl?.startsWith('https://res.cloudinary.com/')), 'Media must be ready Cloudinary assets.');
assert(projects.every(item => item.status === 'published' && urls.has(item.published?.visual)), 'Every published project needs registered Cloudinary media.');
assert(new Set(projects.map(item => item.published?.slug)).size === projects.length, 'Project slugs must be unique.');
console.log(JSON.stringify({verified:true, projectId, projects:projects.length, experiences:experiences.length,
  education:education.length, credentials:credentials.length, media:media.length,
  publishedResearch:research.filter(item => item.status === 'published').length,
  draftThoughts:thoughts.filter(item => item.status === 'draft').length}));
