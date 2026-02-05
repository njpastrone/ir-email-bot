import express from 'express';
import { fetchCompanyNews, formatNewsForPrompt } from '../services/news.js';
import { generateEmail } from '../services/claude.js';

const router = express.Router();

router.post('/generate-email', async (req, res) => {
  try {
    const {
      companyName,
      contactName,
      senderName,
      firmName,
      preferredSources
    } = req.body;

    // Validate required fields
    if (!companyName || !contactName || !senderName) {
      return res.status(400).json({
        error: 'Missing required fields: companyName, contactName, and senderName are required'
      });
    }

    // Use default firm name if not provided
    const firm = firmName || 'Rivel Research Group';

    // Fetch recent news about the company
    const articles = await fetchCompanyNews(companyName, preferredSources);
    const newsContext = formatNewsForPrompt(articles);

    // Generate the email using Claude
    const email = await generateEmail({
      companyName,
      contactName,
      senderName,
      firmName: firm,
      newsContext
    });

    res.json({
      email,
      articlesFound: articles.length,
      sources: articles.map(a => a.source)
    });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({
      error: 'Failed to generate email',
      details: error.message
    });
  }
});

export default router;
