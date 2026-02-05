import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const client = new Anthropic();

// =============================================================================
// LEGACY PROMPT (preserved for reference/comparison)
// =============================================================================
const LEGACY_BASE_PROMPT = `You are an investor relations consultant writing a cold outbound email to a senior executive of a publicly traded company.

First, identify the company's most recent market-facing challenges by referencing credible, current financial journalism (for example, recent Wall Street Journal coverage). Distill these challenges into two to three concise, valuation-relevant themes that investors appear focused on. Do not quote articles directly, but reflect their substance accurately.

Then, write a human-sounding email that follows this structure:

- Open by noting that you have recently read a few articles about the company and briefly summarize the market perception or investor concern implied by those articles.
- Position your firm as specializing in investor perception research and expectation management, including understanding what investors truly believe, identifying gaps between management intent and market interpretation, and helping leadership teams proactively address those gaps. Keep it conversational, not marketing copy.
- End with a single, low-pressure question asking whether a short conversation would be useful.

Style constraints:

- Avoid buzzwords, jargon, and formulaic sales language.
- Do not use em dashes.
- Do not use emojis.
- Avoid rigid lists or obvious rhetorical structures.
- Make it sound like it was written by a real person, not an AI.
- Include a subtle but intriguing subject line that does not reveal the pitch.

Output only the final email, including the subject line but without a signature, with no explanation of your process.`;

// =============================================================================
// IMPROVED PROMPT (v2) - Restructured using prompt engineering best practices
// - XML tags for clear section separation
// - Positive framing (no negative constraints)
// - Few-shot examples for consistency
// - Strategic information placement
// - Explicit output format with anchoring
// =============================================================================
const BASE_PROMPT = `<role>
You are a senior IR consultant{{firmNameClause}} with 15 years of experience advising
public companies on investor perception. You write emails quickly between client
meetings, naturally conversational because you've had thousands of similar conversations.
</role>

<context>
IROs and executives receive 50+ cold emails daily and delete anything that looks
templated. Emails referencing specific recent company news prove the sender did
research and get 3x higher response rates. The goal is starting a conversation,
not closing a sale.
</context>

<task>
Write a cold outreach email to {{contactName}} at {{companyName}}.

1. Review the company research below
2. Identify 2-3 valuation-relevant themes investors are focused on
3. Select the single theme most relevant to someone in the recipient's role
4. Write the email naturally incorporating that theme
</task>

<company_research>
{{newsContext}}
</company_research>

<recipient_context>
{{roleContext}}
</recipient_context>

<email_structure>
Paragraph 1 - THE PAIN (1-2 sentences):
Reference that you saw the news (name the source and general topic), then
acknowledge the TYPE of challenge they're facing. Stay humble and conversational.
You understand the general situation, but you're not pretending to know their
internal details. Example: "I saw that Journal piece on the margin questions.
That's always a tough narrative to manage." Keep it light and empathetic, not
detailed or presumptuous.

Paragraph 2 - THE MEDICINE (2-3 sentences):
Show we've helped others in similar situations, then keep the description of
what we do conversational and general. Connect to the type of problem, not
specific metrics or details you couldn't know. Example: "We've helped other
healthcare companies navigate similar situations, basically getting clarity on
what investors are actually focused on versus what's landing from management.
Often there's a gap that's addressable once you can see it." Stay conversational.

Paragraph 3 - THE CALL TO ACTION (1-2 sentences):
Propose a specific next step with a timeframe. Always include "this week or next"
or similar. Keep the ask simple and direct: "Do you have 15 minutes later this
week or next to discuss?" or "Would a quick call this week or next be helpful?"
Avoid awkward phrases like "compare notes" or "swap perspectives."
</email_structure>

<tone_guidance>
The email should sound like a quick note from someone who saw the news and thought
of them, not a detailed analysis. You're not trying to prove how much you know.
You're showing you understand the type of challenge and offering to help.
Stay humble. Stay conversational. If it sounds like a consultant showing off
research, you've gone too far.
</tone_guidance>

<style>
Write as you would email a respected colleague: direct, professional, warm.
Use short sentences and everyday words a busy executive would use.
Punctuate with commas and periods.
Match the rhythm of natural speech, with occasional fragments for emphasis.
{{toneInstruction}}
{{lengthInstruction}}
</style>

<examples>
<example>
<scenario>Healthcare company, CFO recipient, margin pressure theme</scenario>
<output>
Subject: Quick question about analyst sentiment

Hi James,

I saw that Journal piece on Meridian's margin outlook. That's always a tricky narrative to manage.

We've helped other healthcare CFOs in similar spots get clarity on what investors are actually focused on versus what's landing. Often there's a gap worth addressing.

Do you have 15 minutes later this week or next to discuss?

Best,
Sarah
</output>
</example>

<example>
<scenario>Logistics company, IRO recipient, concentration risk theme</scenario>
<output>
Subject: Investor perception question

Hi Maria,

I came across that Bloomberg piece on Vertex and the customer concentration question. I imagine that's a frustrating narrative when there's more to the story.

We've worked with other IR teams dealing with similar concerns, helping them understand what's actually driving investor sentiment and where the messaging might be missing. Sometimes it's a smaller fix than you'd expect.

Would a quick call this week or next be helpful?

Best,
Michael
</output>
</example>

<example>
<scenario>Tech company, CEO recipient, growth slowdown theme</scenario>
<output>
Subject: Quick thought on the narrative

Hi David,

I noticed that Reuters piece on Nexus and the growth questions. Shifting the narrative from hypergrowth to sustainable growth is always a tough one.

We've helped other tech CEOs navigate that transition, getting clarity on what investors need to hear. Happy to share what's worked.

Are you free for a quick call later this week or next?

Best,
Rachel
</output>
</example>
</examples>

<output_format>
Output a JSON object with this exact structure (no markdown fences, no preamble):

{
  "email": "[Complete email text]",
  "citedArticleIndex": [1-based index of the article you referenced in paragraph 1]
}

The email field must contain the complete email in this format:
Subject: [under 50 characters, intriguing but not salesy]

[Paragraph 1 - reference the article at citedArticleIndex]

[Paragraph 2]

[Paragraph 3]

Best,
{{senderName}}

Start the JSON directly with { - no preamble.
End with } - no commentary after.
</output_format>`;

const TONE_MODIFIERS = {
  conversational: 'Keep the tone casual and conversational, as if sent between meetings.',
  formal: 'Use professional, polished language appropriate for executive correspondence.',
  direct: 'Be concise and get to the point quickly. Every sentence should earn its place.'
};

const ROLE_CONTEXT = {
  iro: 'The recipient is an Investor Relations Officer. They struggle with perception gaps, have limited resources for comprehensive research, and need external validation to influence C-suite messaging. Speak to these pain points.',
  ceo: 'The recipient is a CEO. They care about valuation disconnect, controlling the market narrative, and how leadership is perceived by investors. Frame value in terms of strategic positioning.',
  cfo: 'The recipient is a CFO. They focus on analyst expectations, financial communication effectiveness, and guidance credibility. Emphasize quantitative perception insights.'
};

const LENGTH_MODIFIERS = {
  brief: 'Keep to 60-80 words total. Be extremely concise.',
  standard: 'Keep to 80-120 words total across the 3 paragraphs.',
  detailed: 'You may extend to 120-150 words with more specific news references.'
};

export function getPromptInfo() {
  return {
    basePrompt: BASE_PROMPT,
    legacyPrompt: LEGACY_BASE_PROMPT,
    toneModifiers: TONE_MODIFIERS,
    roleContext: ROLE_CONTEXT,
    lengthModifiers: LENGTH_MODIFIERS,
    dynamicInputs: [
      { name: 'companyName', description: 'The target company name or ticker' },
      { name: 'contactName', description: 'The recipient\'s name' },
      { name: 'senderName', description: 'Your first name for the sign-off' },
      { name: 'firmName', description: 'Your firm name' },
      { name: 'newsContext', description: 'Recent news articles about the company (fetched automatically)' }
    ],
    promptVersion: 'v2-structured'
  };
}

export async function generateEmail({
  companyName,
  contactName,
  senderName,
  firmName,
  newsContext,
  tone = 'conversational',
  contactRole = 'iro',
  length = 'standard',
  useLegacyPrompt = false
}) {
  const toneInstruction = TONE_MODIFIERS[tone] || TONE_MODIFIERS.conversational;
  const roleContext = ROLE_CONTEXT[contactRole] || ROLE_CONTEXT.iro;
  const lengthInstruction = LENGTH_MODIFIERS[length] || LENGTH_MODIFIERS.standard;

  let prompt;

  if (useLegacyPrompt) {
    // Use the original unstructured prompt
    prompt = `${LEGACY_BASE_PROMPT}

Additional style instruction: ${toneInstruction}

Recipient context: ${roleContext}

Length guidance: ${lengthInstruction}

Context for this email:
- Company: ${companyName}
- Recipient name: ${contactName}
- Sender name: ${senderName}${firmName ? `\n- Sender's firm: ${firmName}` : ''}

Recent news about ${companyName}:
${newsContext}

Generate the email now.`;
  } else {
    // Use the new structured prompt (v2)
    // Replace all template variables in the structured prompt
    const firmNameClause = firmName ? ` at ${firmName}` : '';
    prompt = BASE_PROMPT
      .replace(/\{\{firmNameClause\}\}/g, firmNameClause)
      .replace(/\{\{contactName\}\}/g, contactName)
      .replace(/\{\{companyName\}\}/g, companyName)
      .replace(/\{\{senderName\}\}/g, senderName)
      .replace(/\{\{newsContext\}\}/g, newsContext)
      .replace(/\{\{roleContext\}\}/g, roleContext)
      .replace(/\{\{toneInstruction\}\}/g, toneInstruction)
      .replace(/\{\{lengthInstruction\}\}/g, lengthInstruction);
  }

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

  const rawText = response.content[0].text;

  // Try to parse as JSON (new structured format)
  try {
    const parsed = JSON.parse(rawText);
    return {
      email: parsed.email,
      citedArticleIndex: parsed.citedArticleIndex,
      prompt
    };
  } catch {
    // Fallback: return raw text as email (legacy format or parsing failure)
    return {
      email: rawText,
      citedArticleIndex: null,
      prompt
    };
  }
}

// Export for testing/comparison
export async function generateEmailComparison(params) {
  const [newVersion, legacyVersion] = await Promise.all([
    generateEmail({ ...params, useLegacyPrompt: false }),
    generateEmail({ ...params, useLegacyPrompt: true })
  ]);

  return {
    v2Structured: newVersion,
    v1Legacy: legacyVersion
  };
}

// Generate a brief summary of the news themes for display
export async function generateNewsSummary({ companyName, newsContext }) {
  const prompt = `<task>
Summarize the key investor-relevant themes from recent news about ${companyName} in 1-2 sentences.
Focus on what investors and analysts are paying attention to.
</task>

<news>
${newsContext}
</news>

<output_format>
Write a single concise summary (1-2 sentences, under 40 words) that captures the main themes.
Start directly with the summary. No preamble like "Here's" or "The news shows".
Example: "Recent coverage focuses on margin pressures amid rising input costs and questions about the international expansion timeline."
</output_format>`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return response.content[0].text.trim();
}

export async function refineEmail({ messages, instruction }) {
  const refinementMessage = {
    role: 'user',
    content: `Revise the email based on this instruction: ${instruction}\n\nReturn ONLY the complete revised email (including Subject: line). No JSON, no explanation.`
  };

  const allMessages = [...messages, refinementMessage];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: allMessages
  });

  const revisedEmail = response.content[0].text.trim();

  return {
    email: revisedEmail,
    updatedMessages: [...allMessages, { role: 'assistant', content: revisedEmail }]
  };
}
