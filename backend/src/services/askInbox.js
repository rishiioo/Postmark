import { generateJSON } from './llmClient.js';

const SYSTEM = `You answer questions about an email inbox for a personal assistant. Use ONLY the thread list provided.
Return ONLY JSON: {"answer": "<short helpful answer>", "threadIds": ["<ids of the threads you refer to, max 5>"]}.
Only include ids that appear in the list.`;

function fallback(question, threads) {
  const q = question.toLowerCase();
  const pick = (fn, yes, no) => {
    const found = threads.filter(fn);
    return { answer: found.length ? yes : no, threadIds: found.slice(0, 5).map((t) => String(t.id)) };
  };
  if (q.includes('client')) return pick((t) => t.classification === 'Client to Reply', 'These need the client’s personal reply:', 'Nothing needs the client right now.');
  if (q.includes('waiting')) return pick((t) => t.classification === 'Waiting for Response', 'You are waiting on a response for:', 'You are not waiting on anyone.');
  if (q.includes('review')) return pick((t) => t.needsReview, 'The AI was unsure about these:', 'Nothing is flagged for review.');
  if (q.includes('meeting') || q.includes('schedule')) return pick((t) => t.classification === 'Meetings', 'Scheduling requests:', 'No scheduling requests found.');
  return pick((t) => ['Assistant to Reply', 'Client to Reply', 'Action Required'].includes(t.classification), 'These need a reply or action:', 'Everything is handled.');
}

export async function processAskInboxQuery(question, threads) {
  const active = threads.filter((t) => !t.isArchived);
  const compact = active.map((t) => ({
    id: String(t.id), subject: t.subject, summary: t.summary, classification: t.classification,
    needsReview: t.needsReview, handledBy: t.handledBy, isCompleted: t.isCompleted, lastMessageAt: t.lastMessageAt,
  }));
  try {
    const out = await generateJSON({ system: SYSTEM, prompt: `Threads:\n${JSON.stringify(compact)}\n\nQuestion: ${question}` });
    const ids = new Set(compact.map((t) => t.id));
    return {
      answer: String(out.answer || 'Here is what I found.'),
      threadIds: (Array.isArray(out.threadIds) ? out.threadIds : []).map(String).filter((id) => ids.has(id)).slice(0, 5),
    };
  } catch (err) {
    console.warn('Ask Inbox LLM failed, using keyword fallback:', err.message);
    return fallback(question, compact);
  }
}
