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
Write an email to {{contactName}} at {{companyName}}.

1. Review the company research below
2. Identify 2-3 valuation-relevant themes investors are focused on
3. Select the single theme most relevant to someone in the recipient's role
4. When choosing which article to cite, prefer coverage from the Wall Street
   Journal, Bloomberg, or Financial Times because referencing a well-respected
   financial publication adds credibility. Use other sources only when these
   three have no relevant coverage.
5. Write the email naturally incorporating that theme
</task>

<company_research>
{{newsContext}}
</company_research>

{{additionalContext}}

<relationship_context>
{{relationshipContext}}
</relationship_context>

<recipient_context>
{{roleContext}}
</recipient_context>

<email_structure>
{{emailStructure}}
</email_structure>

<tone_guidance>
The email should sound like a quick note from a busy professional, written between
meetings. You're reaching out because something made this relevant right now.
Stay humble and conversational. The recipient should feel this email was written
specifically for them, prompted by something real.

If the email reads like a consultant demonstrating expertise or a salesperson
building a case, rewrite it until it sounds like a peer reaching out with a
genuine observation or a straightforward introduction.
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
{{examples}}
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

const RELATIONSHIP_MODIFIERS = {
  cold: `This is a first-time outreach to someone you have never met or spoken with.
Open paragraph 1 directly with the news reference. Lead with the specific article you noticed, because proving you did research is what separates this from the 50+ templated emails they receive daily.
The reader should feel this email was prompted by something specific you read, with no prior relationship assumed.`,
  warm: `You have an existing relationship with the recipient — you've met, spoken, or worked together before.
After the "Hi [Name]," greeting, open paragraph 1 with a brief warm note (e.g., "Hope you've been well" or "It's been a while"), then transition into the news reference. Keep the warm opener to one short clause — busy executives appreciate brevity, and a quick personal touch is more genuine than a long reconnection preamble.
For paragraph 3, frame the CTA as reconnecting: "Would love to catch up" or "Happy to reconnect over a quick call this week or next." The ask should feel natural between people who already know each other.`
};

const NEWS_FIRST_STRUCTURE = `Paragraph 1 - THE PAIN (1-2 sentences):
Reference that you saw the news (name the source and general topic), then
acknowledge the TYPE of challenge they're facing. Stay humble and conversational.
You understand the general situation, but you're reaching out as a peer who
noticed something relevant, not as someone pretending to know their internal details.

Paragraph 2 - THE INSIGHT (2-3 sentences):
Describe the universal challenge that companies in their situation face. Frame it
as an observation about their world, because recipients engage when they recognize
their own experience described back to them. The reader should feel "that's exactly
my situation."

Focus on the gap between what management intends to communicate and what investors
actually hear. This perception gap is the core insight, and naming it as a universal
pattern is more compelling than listing credentials.

As an acceptable alternative, you may reference having helped others in similar
situations, but keep the center of gravity on the recipient's challenge.

Paragraph 3 - THE CALL TO ACTION (1-2 sentences):
Propose a specific next step with a timeframe. Include "this week or next" or
similar. Keep the ask simple and direct. You can add reciprocity (e.g., "happy to
share what we typically see and hear your perspective") because a two-way
conversation is easier to say yes to than a one-way pitch.`;

const INTRO_FIRST_STRUCTURE = `Paragraph 1 - THE INTRODUCTION (1-2 sentences):
Open with your name and your team at your firm. Reference the recipient's industry
(e.g., "I'm part of the [industry] team here at [firm]") because industry-specific
positioning signals relevance over generic outreach. Busy executives want to know
immediately who you are and why you're reaching out.

Paragraph 2 - THE VALUE (2-3 sentences):
Connect what your team works on to challenges relevant to the recipient's role and
industry. Describe outcomes (e.g., "getting clarity on investor sentiment") rather
than services (e.g., "we conduct perception studies"), because executives care about
what you solve, not what you call it. Reference specific pain points tied to their
role.

Paragraph 3 - THE CALL TO ACTION (1-2 sentences):
Ask for time on their calendar with a specific timeframe ("this week" or "later this
week"). Keep the ask direct and logistically simple. Suggesting "let me know when
works best and I'll send an invite" removes friction and makes it easy to say yes.`;

const NEWS_FIRST_EXAMPLES = `<example>
<scenario>Industrial company, Head of IR, M&A acquisition theme (PREFERRED STYLE — insight-driven, about them)</scenario>
<output>
Subject: Quick thought about the Crestline acquisition

Hi Leslie,

I saw that Journal piece on the Crestline acquisition. That's a big strategic bet that probably has investors asking a lot of questions about integration and synergies.

Many management teams in the middle of an M&A story find that what they intend to communicate and what investors actually hear aren't always the same. When you can clearly see where that gap exists, it becomes much easier to address the questions, concerns, and priorities that are really driving investor behavior.

Happy to share what we typically see and hear your perspective. Do you have 15 minutes later this week or next to discuss?

Best,
Sarah
</output>
</example>

<example>
<scenario>Consumer company, Head of IR, leadership transition theme (acceptable alternative style)</scenario>
<output>
Subject: CFO transition messaging

Hi James,

I saw that Journal piece on your CFO transition. Leadership changes always create extra narrative complexity during an already challenging time.

We've helped other IR teams manage similar situations, getting clarity on what investors are actually focused on versus what's coming through in the messaging. Often there's a disconnect that's addressable once you can see it clearly.

Do you have 15 minutes later this week or next to discuss?

Best,
Michael
</output>
</example>

<example>
<scenario>Tech company, CFO recipient, restructuring theme (acceptable alternative style)</scenario>
<output>
Subject: Quick question on restructuring messaging

Hi Dan,

I saw that Journal piece on Apex's restructuring and headcount reduction. Those cost discipline stories can be tough to frame positively with analysts.

We've helped other CFOs navigate similar restructuring communications, getting clarity on what the Street actually wants to hear about efficiency versus what might be coming across as weakness. Often there's a messaging gap that's addressable once you see it.

Do you have 15 minutes later this week or next to discuss?

Best,
Rachel
</output>
</example>`;

const INTRO_FIRST_EXAMPLES = `<example>
<scenario>Healthcare company, IRO recipient, cold intro-first outreach</scenario>
<output>
Subject: Introduction from Orion's healthcare team

Hi Maria,

My name is Sarah, and I'm part of the healthcare team here at Orion Advisory.

We work with IR teams in the healthcare space to understand what investors are actually focused on and where the messaging might be landing differently than intended. My team specifically focuses on priorities related to perception gaps, analyst sentiment, and positioning around key catalysts.

Do you have availability for an introduction this week? Let me know when works best and I'll send an invite.

Looking forward to it,
Sarah
</output>
</example>

<example>
<scenario>Industrial company, CFO recipient, existing relationship intro-first outreach</scenario>
<output>
Subject: Introduction from your Orion advisory team

Hi James,

My name is Michael, and I'm part of Orion's IR advisory team responsible for supporting Vertex Industries. Given your role, I'm looking to introduce our team and get aligned with your priorities going forward.

My team specifically works on priorities related to investor perception, expectation management, and narrative positioning. We work with clients to get clarity on what investors are actually focused on and where there might be gaps worth addressing.

I'm looking to set some time for an introduction as my team will be the main point of contact for any priorities in these areas going forward. What does your availability look like later this week?

Thanks in advance,
Michael
</output>
</example>`;

const STRUCTURE_MODIFIERS = {
  'news-first': {
    emailStructure: NEWS_FIRST_STRUCTURE,
    examples: NEWS_FIRST_EXAMPLES
  },
  'intro-first': {
    emailStructure: INTRO_FIRST_STRUCTURE,
    examples: INTRO_FIRST_EXAMPLES
  }
};

export function getPromptInfo() {
  return {
    basePrompt: BASE_PROMPT,
    legacyPrompt: LEGACY_BASE_PROMPT,
    toneModifiers: TONE_MODIFIERS,
    roleContext: ROLE_CONTEXT,
    lengthModifiers: LENGTH_MODIFIERS,
    relationshipModifiers: RELATIONSHIP_MODIFIERS,
    structureModifiers: STRUCTURE_MODIFIERS,
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
  additionalContext = '',
  tone = 'conversational',
  contactRole = 'iro',
  length = 'standard',
  relationship = 'cold',
  structure = 'news-first',
  useLegacyPrompt = false
}) {
  const toneInstruction = TONE_MODIFIERS[tone] || TONE_MODIFIERS.conversational;
  const roleContext = ROLE_CONTEXT[contactRole] || ROLE_CONTEXT.iro;
  const lengthInstruction = LENGTH_MODIFIERS[length] || LENGTH_MODIFIERS.standard;
  const relationshipContext = RELATIONSHIP_MODIFIERS[relationship] || RELATIONSHIP_MODIFIERS.cold;
  const structureMod = STRUCTURE_MODIFIERS[structure] || STRUCTURE_MODIFIERS['news-first'];

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
    const additionalContextBlock = additionalContext
      ? `<sender_context>\nThe sender has provided additional context about what they'd like the email to focus on:\n${additionalContext}\nUse this to guide which theme you select and reference in paragraph 1.\n</sender_context>`
      : '';
    prompt = BASE_PROMPT
      .replace(/\{\{firmNameClause\}\}/g, firmNameClause)
      .replace(/\{\{contactName\}\}/g, contactName)
      .replace(/\{\{companyName\}\}/g, companyName)
      .replace(/\{\{senderName\}\}/g, senderName)
      .replace(/\{\{newsContext\}\}/g, newsContext)
      .replace(/\{\{additionalContext\}\}/g, additionalContextBlock)
      .replace(/\{\{roleContext\}\}/g, roleContext)
      .replace(/\{\{relationshipContext\}\}/g, relationshipContext)
      .replace(/\{\{emailStructure\}\}/g, structureMod.emailStructure)
      .replace(/\{\{examples\}\}/g, structureMod.examples)
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
