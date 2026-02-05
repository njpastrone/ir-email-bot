import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['source']
  }
});

const DEFAULT_SOURCES = [
  'Wall Street Journal',
  'Bloomberg',
  'Reuters',
  'Financial Times',
  'CNBC',
  "Barron's",
  "Investor's Business Daily",
  'Yahoo Finance',
  'Seeking Alpha'
];

export async function fetchCompanyNews(companyName, preferredSources = DEFAULT_SOURCES) {
  const encodedCompany = encodeURIComponent(companyName);
  const feedUrl = `https://news.google.com/rss/search?q=${encodedCompany}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const feed = await parser.parseURL(feedUrl);

    const articles = feed.items.slice(0, 15).map(item => {
      // Extract source from title (Google News format: "Title - Source")
      const titleParts = item.title.split(' - ');
      const source = titleParts.length > 1 ? titleParts.pop().trim() : 'Unknown';
      const title = titleParts.join(' - ').trim();

      return {
        title,
        source,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet || ''
      };
    });

    // Prioritize articles from preferred sources
    const prioritized = articles.sort((a, b) => {
      const aPreferred = preferredSources.some(s =>
        a.source.toLowerCase().includes(s.toLowerCase())
      );
      const bPreferred = preferredSources.some(s =>
        b.source.toLowerCase().includes(s.toLowerCase())
      );

      if (aPreferred && !bPreferred) return -1;
      if (!aPreferred && bPreferred) return 1;
      return 0;
    });

    return prioritized.slice(0, 8);
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export function formatNewsForPrompt(articles) {
  if (articles.length === 0) {
    return 'No recent news articles found.';
  }

  return articles.map((article, i) =>
    `${i + 1}. "${article.title}" (${article.source}, ${new Date(article.pubDate).toLocaleDateString()})`
  ).join('\n');
}
