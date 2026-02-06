import express from 'express';
import { fetchCompanyNews, formatNewsForPrompt } from '../services/news.js';
import { generateEmail, generateEmailComparison, generateNewsSummary, getPromptInfo, refineEmail } from '../services/claude.js';

const router = express.Router();

router.get('/prompt-info', (req, res) => {
  try {
    const promptInfo = getPromptInfo();
    res.json(promptInfo);
  } catch (error) {
    console.error('Error fetching prompt info:', error);
    res.status(500).json({ error: 'Failed to fetch prompt info' });
  }
});

router.post('/generate-email', async (req, res) => {
  try {
    const {
      companyName,
      contactName,
      senderName,
      firmName,
      preferredSources,
      additionalContext,
      tone,
      contactRole,
      length,
      relationship,
      structure,
      useLegacyPrompt
    } = req.body;

    // Validate required fields
    if (!companyName || !contactName || !senderName) {
      return res.status(400).json({
        error: 'Missing required fields: companyName, contactName, and senderName are required'
      });
    }

    // Use default firm name if not provided
    const firm = firmName || '';

    // Fetch recent news about the company
    const articles = await fetchCompanyNews(companyName, preferredSources);
    const newsContext = formatNewsForPrompt(articles);

    // Generate the email and news summary in parallel
    const [emailResult, newsSummary] = await Promise.all([
      generateEmail({
        companyName,
        contactName,
        senderName,
        firmName: firm,
        newsContext,
        additionalContext: additionalContext || '',
        tone: tone || 'conversational',
        contactRole: contactRole || 'iro',
        length: length || 'standard',
        relationship: relationship || 'cold',
        structure: structure || 'news-first',
        useLegacyPrompt: useLegacyPrompt || false
      }),
      generateNewsSummary({ companyName, newsContext })
    ]);

    // Format articles for response
    const formattedArticles = articles.map(a => ({
      title: a.title,
      source: a.source,
      publishedAt: a.pubDate,
      url: a.link
    }));

    // Determine cited article
    let citedArticle = null;
    const { email, citedArticleIndex, prompt: originalPrompt } = emailResult;

    // Try using the index from Claude's response
    if (citedArticleIndex && citedArticleIndex >= 1 && citedArticleIndex <= formattedArticles.length) {
      citedArticle = formattedArticles[citedArticleIndex - 1];
    } else {
      // Fallback: heuristic matching based on source name in email
      const sourcePatterns = [
        { pattern: /journal/i, source: 'Wall Street Journal' },
        { pattern: /wsj/i, source: 'Wall Street Journal' },
        { pattern: /bloomberg/i, source: 'Bloomberg' },
        { pattern: /reuters/i, source: 'Reuters' },
        { pattern: /financial times|ft\b/i, source: 'Financial Times' },
        { pattern: /cnbc/i, source: 'CNBC' },
        { pattern: /barron/i, source: "Barron's" },
        { pattern: /investor.*business/i, source: "Investor's Business Daily" },
        { pattern: /yahoo/i, source: 'Yahoo Finance' },
        { pattern: /seeking alpha/i, source: 'Seeking Alpha' }
      ];

      for (const { pattern, source } of sourcePatterns) {
        if (pattern.test(email)) {
          const matchedArticle = formattedArticles.find(a =>
            a.source && a.source.toLowerCase().includes(source.toLowerCase())
          );
          if (matchedArticle) {
            citedArticle = matchedArticle;
            break;
          }
        }
      }
    }

    res.json({
      email,
      citedArticle,
      newsSummary,
      promptVersion: useLegacyPrompt ? 'v1-legacy' : 'v2-structured',
      articlesFound: articles.length,
      sources: articles.map(a => a.source),
      articles: formattedArticles,
      messages: [
        { role: 'user', content: originalPrompt },
        { role: 'assistant', content: email }
      ]
    });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({
      error: 'Failed to generate email',
      details: error.message
    });
  }
});

// Refine an existing email with a new instruction
router.post('/refine-email', async (req, res) => {
  try {
    const { messages, instruction } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length < 2) {
      return res.status(400).json({
        error: 'Missing or invalid messages array (must contain at least 2 entries)'
      });
    }

    if (!instruction || !instruction.trim()) {
      return res.status(400).json({
        error: 'Missing refinement instruction'
      });
    }

    const result = await refineEmail({ messages, instruction: instruction.trim() });

    res.json({
      email: result.email,
      messages: result.updatedMessages
    });
  } catch (error) {
    console.error('Error refining email:', error);
    res.status(500).json({
      error: 'Failed to refine email',
      details: error.message
    });
  }
});

// Compare both prompt versions side-by-side
router.post('/compare-prompts', async (req, res) => {
  try {
    const {
      companyName,
      contactName,
      senderName,
      firmName,
      preferredSources,
      tone,
      contactRole,
      length
    } = req.body;

    // Validate required fields
    if (!companyName || !contactName || !senderName) {
      return res.status(400).json({
        error: 'Missing required fields: companyName, contactName, and senderName are required'
      });
    }

    const firm = firmName || '';

    // Fetch recent news about the company
    const articles = await fetchCompanyNews(companyName, preferredSources);
    const newsContext = formatNewsForPrompt(articles);

    // Generate both versions in parallel
    const comparison = await generateEmailComparison({
      companyName,
      contactName,
      senderName,
      firmName: firm,
      newsContext,
      tone: tone || 'conversational',
      contactRole: contactRole || 'iro',
      length: length || 'standard'
    });

    res.json({
      comparison,
      articlesFound: articles.length,
      sources: articles.map(a => a.source),
      articles: articles.map(a => ({
        title: a.title,
        source: a.source,
        publishedAt: a.pubDate,
        url: a.link
      }))
    });
  } catch (error) {
    console.error('Error comparing prompts:', error);
    res.status(500).json({
      error: 'Failed to compare prompts',
      details: error.message
    });
  }
});

export default router;
