import Thread from '../models/Thread.js';
import Rule from '../models/Rule.js';
import { classifyThread } from '../services/classifyThread.js';
import { generateDraftReply } from '../services/draftReply.js';
import { processAskInboxQuery } from '../services/askInbox.js';

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, err, status = 500) => res.status(status).json({ success: false, error: err.message || String(err) });

// Fields the frontend is allowed to change with PATCH.
const PATCHABLE = [
  'classification', 'correctedByUser', 'needsReview', 'confidence', 'reason',
  'isRead', 'isImportant', 'isArchived', 'isCompleted', 'handledBy', 'handledAt', 'messages', 'lastMessageAt',
];

async function applyClassification(thread) {
  const ai = await classifyThread({ subject: thread.subject, messages: thread.messages });
  const { source, ...fields } = ai;
  Object.assign(thread, fields);
  await thread.save();
  return { thread, source };
}

export const listThreads = async (req, res) => {
  try {
    const { classification, q, needsReview, archived } = req.query;
    const filter = {};
    if (classification) filter.classification = classification;
    if (needsReview === 'true') filter.needsReview = true;
    if (archived === 'true') filter.isArchived = true;
    if (q) {
      const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ subject: rx }, { summary: rx }, { 'participants.name': rx }, { 'participants.email': rx }];
    }
    ok(res, await Thread.find(filter).sort({ lastMessageAt: -1 }));
  } catch (err) { fail(res, err); }
};

export const getThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return fail(res, new Error('Thread not found'), 404);
    ok(res, thread);
  } catch (err) { fail(res, err, 400); }
};

export const updateThread = async (req, res) => {
  try {
    const patch = {};
    for (const key of PATCHABLE) if (key in req.body) patch[key] = req.body[key];
    const thread = await Thread.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!thread) return fail(res, new Error('Thread not found'), 404);
    ok(res, thread);
  } catch (err) { fail(res, err, 400); }
};

export const classifyOne = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return fail(res, new Error('Thread not found'), 404);
    const { thread: saved, source } = await applyClassification(thread);
    res.json({ success: true, data: saved, source });
  } catch (err) { fail(res, err); }
};

// Classifies every thread that has no confidence score yet (used after seeding / onboarding sync).
export const classifyAll = async (_req, res) => {
  try {
    const pending = await Thread.find({ $or: [{ confidence: 0 }, { confidence: { $exists: false } }] });
    for (const thread of pending) await applyClassification(thread);
    ok(res, { classified: pending.length });
  } catch (err) { fail(res, err); }
};

export const draftForThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return fail(res, new Error('Thread not found'), 404);
    ok(res, { draft: await generateDraftReply(thread.toJSON()) });
  } catch (err) { fail(res, err); }
};

export const createRule = async (req, res) => {
  try {
    const { senderEmail, classification } = req.body;
    if (!senderEmail || !classification) return fail(res, new Error('senderEmail and classification are required'), 400);
    const rule = await Rule.findOneAndUpdate(
      { senderEmail: senderEmail.toLowerCase().trim() },
      { classification },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    ok(res, rule, 201);
  } catch (err) { fail(res, err, 400); }
};

export const listRules = async (_req, res) => {
  try { ok(res, await Rule.find().sort({ createdAt: -1 })); } catch (err) { fail(res, err); }
};

export const deleteRule = async (req, res) => {
  try { await Rule.findByIdAndDelete(req.params.id); ok(res, { deleted: true }); } catch (err) { fail(res, err, 400); }
};

export const chat = async (req, res) => {
  try {
    const question = String(req.body.question || '').trim();
    if (!question) return fail(res, new Error('question is required'), 400);
    const threads = (await Thread.find().sort({ lastMessageAt: -1 }).limit(60)).map((t) => t.toJSON());
    res.json({ success: true, ...(await processAskInboxQuery(question, threads)) });
  } catch (err) { fail(res, err); }
};

const SAMPLES = [
  { name: 'Neha Kulkarni', email: 'neha.kulkarni@punebiz.in', subject: 'Reschedule Thursday’s vendor call', body: 'Hi, could we reschedule Thursday’s vendor call to Friday 11 AM? Please confirm availability on the calendar.' },
  { name: 'CA Mohan Joshi', email: 'mohan@joshiassociates.in', subject: 'GST invoice for October — please confirm', body: 'Attached is the GST invoice for October. Kindly confirm the payment date so we can close the books.' },
  { name: 'Ananya Rao', email: 'ananya@northstar.vc', subject: 'Term sheet — need your decision by Monday', body: 'We have shared the revised term sheet. Please approve or share your concerns by Monday, this needs your personal sign off.' },
  { name: 'Tech Weekly', email: 'no-reply@techweekly.io', subject: 'Your weekly digest', body: 'Top stories this week. To unsubscribe click here. This is an automated newsletter.' },
];

// Demo button: a new email arrives. If the sender already has a thread, the message is appended and the
// thread is re-classified (shows that the AI reconsiders when new messages arrive).
export const simulateEmail = async (_req, res) => {
  try {
    const sample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    const me = { name: 'Jordan Davis', email: 'jordan@postmark.in' };
    const sentAt = new Date().toISOString();
    const message = { from: sample.email, to: me.email, body: sample.body, sentAt };

    let thread = await Thread.findOne({ 'participants.email': sample.email, subject: sample.subject });
    if (thread) {
      thread.messages.push(message);
      thread.isRead = false;
      thread.isCompleted = false;
      thread.handledBy = null;
    } else {
      thread = new Thread({ subject: sample.subject, participants: [{ name: sample.name, email: sample.email }, me], messages: [message] });
    }
    thread.lastMessageAt = sentAt;
    const { thread: saved } = await applyClassification(thread);
    ok(res, saved, 201);
  } catch (err) { fail(res, err); }
};
