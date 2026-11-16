import { readFileSync } from 'node:fs';
import mongoose from 'mongoose';
import { config } from '../env.js';
import Thread from '../models/Thread.js';
import Rule from '../models/Rule.js';

// Loads the sample threads (already classified, so reviewers never wait for the AI) into MongoDB.
// Timestamps are shifted so the newest message is about an hour old.
const threads = JSON.parse(readFileSync(new URL('./threads.json', import.meta.url), 'utf8'));

const newest = Math.max(...threads.flatMap((t) => t.messages.map((m) => +new Date(m.sentAt))));
const shift = Date.now() - 60 * 60 * 1000 - newest;
const move = (iso) => new Date(+new Date(iso) + shift).toISOString();

const docs = threads.map((t) => ({
  ...t,
  messages: t.messages.map((m) => ({ ...m, sentAt: move(m.sentAt) })),
  lastMessageAt: move(t.lastMessageAt),
}));

if (!config.mongodbUri) {
  console.error('MONGODB_URI is missing. Copy backend/.env.example to backend/.env first.');
  process.exit(1);
}

await mongoose.connect(config.mongodbUri);
await Thread.deleteMany({});
await Rule.deleteMany({});
await Thread.insertMany(docs);
console.log(`Seeded ${docs.length} threads`);
await mongoose.disconnect();
