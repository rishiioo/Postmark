import mongoose from 'mongoose';

// "Teach the AI": when the assistant corrects a classification they can save a per-sender rule.
// Rules are checked before the LLM is called.
const ruleSchema = new mongoose.Schema(
  {
    senderEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    classification: { type: String, required: true },
  },
  { timestamps: true },
);

ruleSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Rule', ruleSchema);
