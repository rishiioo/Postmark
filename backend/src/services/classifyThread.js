import Rule from '../models/Rule.js';
import { CLASSIFICATIONS, REVIEW_THRESHOLD } from '../constants.js';
import { generateJSON } from './llmClient.js';
import { keywordClassify } from './keywordFallback.js';

const SYSTEM = `You are an assistant helping a personal assistant manage a busy client's inbox. Read the email conversation and decide who must reply.
- "Assistant to Reply": scheduling, routine business inquiries, follow-ups, admin, invoices/quotes needing processing
- "Client to Reply": decisions, approvals, sensitive or strategic matters, anything that explicitly needs the client's personal input
- "No Reply Needed": newsletters, notifications, FYI updates, resolved threads
Secondary folders you may use when they fit better: "Action Required", "Waiting for Response", "Meetings", "Important".
If you are unsure, lower the confidence (below 70).
Return ONLY a JSON object with keys: classification, confidence (integer 0-100), reason (one short sentence), summary (max 2 sentences), deadlines (array of short strings, may be empty).
classification must be exactly one of: ${CLASSIFICATIONS.map((c) => `"${c}"`).join(', ')}.`;

export function formatConversation(thread) {
  const lines = thread.messages.map((m) => `From: ${m.from}\nTo: ${m.to}\nSent: ${m.sentAt}\n${m.body}`);
  return `Subject: ${thread.subject}\n\n${lines.join('\n\n---\n\n')}`;
}

function lastSender(thread) {
  return (thread.messages?.[thread.messages.length - 1]?.from || '').toLowerCase();
}

function validate(raw) {
  if (!raw || !CLASSIFICATIONS.includes(raw.classification)) throw new Error('Invalid classification from LLM');
  const confidence = Math.max(0, Math.min(100, Math.round(Number(raw.confidence))));
  if (Number.isNaN(confidence)) throw new Error('Invalid confidence from LLM');
  return {
    classification: raw.classification,
    confidence,
    reason: String(raw.reason || '').slice(0, 300),
    summary: String(raw.summary || '').slice(0, 500),
    deadlines: Array.isArray(raw.deadlines) ? raw.deadlines.map(String).slice(0, 5) : [],
    needsReview: confidence < REVIEW_THRESHOLD,
    source: 'llm',
  };
}

/**
 * 1) per-sender rule ("Teach the AI")  2) LLM  3) keyword fallback.
 * Accepts a plain thread object ({ subject, messages }). Never throws.
 */
export async function classifyThread(thread) {
  try {
    const rule = await Rule.findOne({ senderEmail: lastSender(thread) }).lean();
    if (rule) {
      const base = keywordClassify(thread);
      return {
        ...base,
        classification: rule.classification,
        confidence: 100,
        reason: 'Matched your saved rule for this sender.',
        needsReview: false,
        source: 'rule',
      };
    }
  } catch (err) {
    console.warn('Rule lookup failed:', err.message);
  }

  try {
    const raw = await generateJSON({ system: SYSTEM, prompt: formatConversation(thread) });
    return validate(raw);
  } catch (err) {
    console.warn('LLM classification failed, using keyword fallback:', err.message);
    return keywordClassify(thread);
  }
}
