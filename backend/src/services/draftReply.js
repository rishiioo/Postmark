import { generateText } from './llmClient.js';
import { formatConversation } from './classifyThread.js';

const SYSTEM = `You write short, professional email replies on behalf of a personal assistant (signing as "Jordan Davis").
Reply in the same language as the conversation. Be concise, polite and specific. Do not invent facts, prices or dates that are not in the conversation.
Return only the email body text, no subject line and no commentary.`;

function templateDraft(thread) {
  const last = thread.messages[thread.messages.length - 1];
  const sender = thread.participants?.find((p) => p.email === last?.from)?.name?.split(' ')[0] || 'there';
  return `Hi ${sender},\n\nThank you for your message regarding "${thread.subject}". I have noted the details and will come back to you shortly with next steps.\n\nBest regards,\nJordan Davis`;
}

// Drafts are NEVER sent automatically; the assistant reviews and approves in the UI.
export async function generateDraftReply(thread) {
  try {
    return await generateText({ system: SYSTEM, prompt: formatConversation(thread) });
  } catch (err) {
    console.warn('Draft generation failed, using template:', err.message);
    return templateDraft(thread);
  }
}
