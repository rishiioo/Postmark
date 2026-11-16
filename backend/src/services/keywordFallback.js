import { REVIEW_THRESHOLD } from '../constants.js';

const has = (text, words) => words.some((w) => text.includes(w));

// Rule-based classifier used when the LLM is unavailable, so the app never breaks during a demo.
export function keywordClassify(thread) {
  const last = thread.messages?.[thread.messages.length - 1];
  const text = `${thread.subject} ${last?.body ?? ''}`.toLowerCase();
  let classification = 'Assistant to Reply';
  let confidence = 62;
  let reason = 'No clear signals, so this is flagged for assistant review.';

  if (has(text, ['unsubscribe', 'newsletter', 'digest', 'no-reply', 'noreply', 'receipt', 'otp', 'security alert', 'fyi'])) {
    classification = 'No Reply Needed'; confidence = 90; reason = 'Looks like a newsletter, notification or FYI update.';
  } else if (has(text, ['approve', 'approval', 'sign off', 'sign-off', 'your decision', 'your call', 'budget', 'contract', 'agreement', 'confidential'])) {
    classification = 'Client to Reply'; confidence = 84; reason = 'Asks for a decision or approval that only the client can give.';
  } else if (has(text, ['reschedule', 'schedule', 'meeting', 'call at', 'calendar', 'availability'])) {
    classification = 'Meetings'; confidence = 82; reason = 'Scheduling request the assistant can handle.';
  } else if (has(text, ['invoice', 'gst', 'quote', 'quotation', 'payment', 'follow up', 'following up', 'reminder'])) {
    classification = 'Assistant to Reply'; confidence = 80; reason = 'Routine business or admin request.';
  } else if (has(text, ['thanks', 'thank you', 'noted', 'resolved'])) {
    classification = 'No Reply Needed'; confidence = 72; reason = 'The conversation looks resolved.';
  }

  const snippet = (last?.body ?? '').replace(/\s+/g, ' ').trim().slice(0, 140);
  return {
    classification,
    confidence,
    reason,
    summary: snippet ? `${thread.subject}: ${snippet}` : thread.subject,
    deadlines: [],
    needsReview: confidence < REVIEW_THRESHOLD,
    source: 'keyword-fallback',
  };
}
