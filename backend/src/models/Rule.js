// Business rules model for email automation
// Fields:
// - senderEmail: string (unique)
// - classification: enum (promotional, transactional, personal, spam, newsletter, support, other)
// - createdAt: Date (from timestamps)

import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true, unique: true },
  classification: {
    type: String,
    enum: ['promotional', 'transactional', 'personal', 'spam', 'newsletter', 'support', 'other'],
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Rule', ruleSchema);