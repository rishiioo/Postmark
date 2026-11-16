// Thread model for emails/conversations
// Fields for thread data:
// - subject, body, from, to, cc, bcc
// - sender details, recipient details
// - timestamps, labels, categories
// - AI classification data, draft replies
// - metadata for synchronization with frontend

import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  threadId: { type: String, required: true, unique: true }, // External reference ID
  subject: { type: String, required: true },
  body: { type: String, required: true },
  from: {
    email: { type: String, required: true },
    name: { type: String, required: true },
  },
  to: [{
    email: { type: String, required: true },
    name: { type: String },
  }],
  cc: [{ email: { type: String } }],
  bcc: [{ email: { type: String } }],
  labels: [{ type: String }],
  category: { type: String }, // AI classification
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  isProcessed: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  threadData: { type: mongoose.Schema.Types.Mixed }, // Raw email data
  aiSummary: { type: String },
  draftReply: { type: String },
  draftReplyConfidence: { type: Number },
}, { timestamps: true });

export default mongoose.model('Thread', threadSchema);
