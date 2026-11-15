// Thread model for emails/conversations
// Fields:
// - subject: string
// - participants: [{ name, email }]
// - messages: [{ from, to, body, sentAt }]
// - classification: enum (promotional, transactional, personal, spam, newsletter, support, other)
// - confidence: number (0-1)
// - reason: string (why it was classified this way)
// - summary: string (AI-generated summary)
// - deadlines: [{ label, date }]
// - segment: enum (inbox, sent, drafts, spam, trash, archive)
// - needsReview: boolean
// - correctedByUser: boolean
// - isRead: boolean
// - isImportant: boolean
// - isArchived: boolean
// - isCompleted: boolean
// - handledBy: enum (client, assistant, null)
// - lastMessageAt: Date
// - timestamps: createdAt, updatedAt

import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: [{ type: String }],
  body: { type: String, required: true },
  sentAt: { type: Date, required: true },
}, { _id: false });

const deadlineSchema = new mongoose.Schema({
  label: { type: String, required: true },
  date: { type: Date, required: true },
}, { _id: false });

const threadSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  participants: [participantSchema],
  messages: [messageSchema],
  classification: {
    type: String,
    enum: ['promotional', 'transactional', 'personal', 'spam', 'newsletter', 'support', 'other'],
    default: 'other',
  },
  confidence: { type: Number, min: 0, max: 1, default: 0 },
  reason: { type: String },
  summary: { type: String },
  deadlines: [deadlineSchema],
  segment: {
    type: String,
    enum: ['inbox', 'sent', 'drafts', 'spam', 'trash', 'archive'],
    default: 'inbox',
  },
  needsReview: { type: Boolean, default: false },
  correctedByUser: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  handledBy: {
    type: String,
    enum: ['client', 'assistant', null],
    default: null,
  },
  lastMessageAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Thread', threadSchema);