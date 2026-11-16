import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  { from: String, to: String, body: String, sentAt: String },
  { _id: false },
);

const threadSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    participants: [{ _id: false, name: String, email: String }],
    messages: [messageSchema],
    classification: { type: String, default: 'Assistant to Reply' },
    confidence: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    summary: { type: String, default: '' },
    deadlines: [String],
    segment: { type: String, enum: ['workspace', 'personal'], default: 'workspace' },
    needsReview: { type: Boolean, default: false },
    correctedByUser: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    handledBy: { type: String, enum: ['client', 'assistant', null], default: null },
    handledAt: { type: String },
    lastMessageAt: { type: String },
  },
  { timestamps: true },
);

// The frontend expects `id` (string) instead of Mongo's `_id`.
threadSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Thread', threadSchema);
