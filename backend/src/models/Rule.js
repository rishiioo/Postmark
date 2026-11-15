// Business rules model for email automation
// Fields for rule configuration:
// - trigger keywords, trigger conditions
// - action types (auto-label, forward, draft, etc.)
// - rule priority, enabled/disabled status
// - user association, metadata

import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trigger: {
    keywords: [{ type: String }],
    fromEmail: { type: String },
    label: { type: String },
    subjectContains: { type: String },
  },
  action: {
    type: { type: String, required: true }, // 'auto-label', 'forward', 'draft', 'keyword-fallback'
    parameters: { type: mongoose.Schema.Types.Mixed }, // Action-specific parameters
    config: { type: mongoose.Schema.Types.Mixed }, // Rule configuration
  },
  priority: { type: Number, default: 0 }, // Higher number = higher priority
  isEnabled: { type: Boolean, default: true },
  metadata: {
    description: { type: String },
    createdBy: { type: String },
  },
}, { timestamps: true });

export default mongoose.model('Rule', ruleSchema);
