import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const client = new Anthropic();

const BASE_PROMPT = `You are an investor relations consultant writing a cold outbound email to the CEO or senior executive of a publicly traded company.

First, identify the company's most recent market-facing challenges by referencing credible, current financial journalism (for example, recent Wall Street Journal coverage). Distill these challenges into two to three concise, valuation-relevant themes that investors appear focused on. Do not quote articles directly, but reflect their substance accurately.

Then, write a short, casual, human-sounding email that follows this structure:

- Open by noting that you have recently read a few articles about the company and briefly summarize the market perception or investor concern implied by those articles.
- Position your firm as specializing in investor perception research and expectation management, including understanding what investors truly believe, identifying gaps between management intent and market interpretation, and helping leadership teams proactively address those gaps. Base this description on Rivel's positioning, without sounding like marketing copy.
- End with a single, low-pressure question asking whether a short conversation would be useful.

Style constraints:

- Keep the email short and conversational, as if sent between meetings.
- Avoid buzzwords, jargon, and formulaic sales language.
- Do not use em dashes.
- Do not use emojis.
- Avoid rigid lists or obvious rhetorical structures.
- Make it sound like it was written by a real person, not an AI.
- Include a subtle but intriguing subject line that does not reveal the pitch.

Output only the final email, including the subject line but without a signature, with no explanation of your process.`;

export async function generateEmail({
  companyName,
  contactName,
  senderName,
  firmName,
  newsContext
}) {
  const prompt = `${BASE_PROMPT}

Context for this email:
- Company: ${companyName}
- Recipient name: ${contactName}
- Sender name: ${senderName}
- Sender's firm: ${firmName}

Recent news about ${companyName}:
${newsContext}

Generate the email now.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return response.content[0].text;
}
