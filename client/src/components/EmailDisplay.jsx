import { useState, useEffect } from 'react';

export default function EmailDisplay({ email, meta }) {
  const [editedEmail, setEditedEmail] = useState(email);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditedEmail(email);
  }, [email]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="card">
      <h2>Generated Email</h2>
      <textarea
        className="email-display email-textarea"
        value={editedEmail}
        onChange={(e) => setEditedEmail(e.target.value)}
      />
      <div className="email-actions">
        <button className="primary" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
      {copied && <p className="success-message">Email copied to clipboard</p>}
      {meta && (
        <p className="meta-info">
          Based on {meta.articlesFound} recent article{meta.articlesFound !== 1 ? 's' : ''}
          {meta.sources?.length > 0 && (
            <> from {[...new Set(meta.sources)].slice(0, 3).join(', ')}
              {meta.sources.length > 3 && ` and ${meta.sources.length - 3} more`}
            </>
          )}
        </p>
      )}
    </div>
  );
}
