import { useState, useEffect } from 'react';

// Parse email into subject and body
function parseEmail(emailText) {
  if (!emailText) return { subject: '', body: '' };

  const lines = emailText.split('\n');
  let subject = '';
  let bodyStartIndex = 0;

  // Find the subject line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith('subject:')) {
      subject = line.substring(8).trim();
      bodyStartIndex = i + 1;
      // Skip any blank lines after subject
      while (bodyStartIndex < lines.length && lines[bodyStartIndex].trim() === '') {
        bodyStartIndex++;
      }
      break;
    }
  }

  const body = lines.slice(bodyStartIndex).join('\n').trim();
  return { subject, body };
}

export default function EmailDisplay({ email, meta, onRefine, isRefining, refineError, canRefine }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState('');

  useEffect(() => {
    const parsed = parseEmail(email);
    setSubject(parsed.subject);
    setBody(parsed.body);
    setRefineInstruction('');
  }, [email]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRefineSubmit = () => {
    if (!refineInstruction.trim() || isRefining) return;
    const currentEmailText = `Subject: ${subject}\n\n${body}`;
    onRefine(refineInstruction.trim(), currentEmailText);
    setRefineInstruction('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter out the cited article from the sources list
  const otherArticles = meta?.articles?.filter(article =>
    !meta?.citedArticle || article.url !== meta.citedArticle.url
  ) || [];

  if (!email) {
    return null;
  }

  return (
    <div className="email-result">
      {/* News Context Summary */}
      {meta?.newsSummary && (
        <div className="news-context">
          <h3 className="news-context-header">What's Happening at {meta.companyName || 'the Company'}</h3>
          <div className="news-summary">
            <p>{meta.newsSummary}</p>
          </div>

          {/* Featured Cited Article */}
          {meta?.citedArticle && (
            <div className="cited-article">
              <div className="cited-article-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Referenced in email</span>
              </div>
              {meta.citedArticle.url ? (
                <a
                  href={meta.citedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cited-article-title"
                >
                  {meta.citedArticle.title}
                </a>
              ) : (
                <span className="cited-article-title">{meta.citedArticle.title}</span>
              )}
              <span className="cited-article-meta">
                {meta.citedArticle.source}{meta.citedArticle.publishedAt && ` · ${formatDate(meta.citedArticle.publishedAt)}`}
              </span>
            </div>
          )}

          {otherArticles.length > 0 && (
            <div className="sources-dropdown">
              <button
                className="sources-toggle"
                onClick={() => setShowSources(!showSources)}
              >
                <span>View Other Sources ({otherArticles.length})</span>
                <svg
                  className={`chevron-icon ${showSources ? 'open' : ''}`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showSources && (
                <ul className="sources-list">
                  {otherArticles.map((article, index) => (
                    <li key={index} className="source-item">
                      {article.url ? (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          {article.title}
                        </a>
                      ) : (
                        <span className="source-link">{article.title}</span>
                      )}
                      <span className="source-meta">
                        {article.source}{article.publishedAt && ` · ${formatDate(article.publishedAt)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Email Section (Primary Focus) */}
      <div className="email-section">
        <div className="email-header">
          <h2>Generated Email</h2>
          <div className="email-actions">
            <button className="secondary copy-btn" onClick={handleCopy}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <div className="feedback-btns">
              <button
                className={`feedback-btn ${feedback === 'up' ? 'active' : ''}`}
                onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                title="Good result"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                </svg>
              </button>
              <button
                className={`feedback-btn ${feedback === 'down' ? 'active' : ''}`}
                onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                title="Needs improvement"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="email-body">
          <input
            type="text"
            className={`subject-input${isRefining ? ' refining' : ''}`}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            disabled={isRefining}
          />
          <textarea
            className={`email-textarea${isRefining ? ' refining' : ''}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isRefining}
          />
        </div>

        {canRefine && (
          <div className="refine-bar">
            <div className="refine-input-row">
              <input
                type="text"
                className="refine-input"
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
                placeholder="Refine: e.g., 'make it shorter' or 'more formal tone'"
                disabled={isRefining}
              />
              <button
                className="refine-btn primary"
                onClick={handleRefineSubmit}
                disabled={isRefining || !refineInstruction.trim()}
              >
                {isRefining ? (
                  <>
                    <span className="spinner-inline" />
                    Refining...
                  </>
                ) : (
                  'Refine'
                )}
              </button>
            </div>
            {refineError && <p className="refine-error">{refineError}</p>}
          </div>
        )}
      </div>

      {copied && <div className="success-toast">Email copied to clipboard</div>}
    </div>
  );
}
