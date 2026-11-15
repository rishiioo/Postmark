// Account model for connected email accounts
// Fields for email account configuration:
// - provider (Gmail, Outlook, etc.)
// - credentials, tokens
// - email address, display name
// - status (connected, disconnected, error)
// - user association, metadata

import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, required: true }, // 'gmail', 'outlook', 'imap', etc.
  emailAddress: { type: String, required: true },
  displayName: { type: String },
  credentials: { type: mongoose.Schema.Types.Mixed }, // Store OAuth tokens, API keys
  status: { type: String, enum: ['connected', 'disconnected', 'error'], default: 'disconnected' },
  syncSettings: {
    direction: { type: String, default: 'down' },
    frequency: { type: String, default: 'manual' }, // 'manual', 'hourly', 'daily'
    lastSync: { type: Date },
    labels: [{ type: String }],
  },
  metadata: {
    source: { type: String }, // 'manual', 'oauth', etc.
    createdBy: { type: String },
  },
}, { timestamps: true });

export default mongoose.model('Account', accountSchema);
