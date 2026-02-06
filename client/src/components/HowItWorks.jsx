import { useState, useEffect } from 'react';

export default function HowItWorks({ variant = 'subtle' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [promptInfo, setPromptInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !promptInfo) {
      setLoading(true);
      fetch('/api/prompt-info')
        .then(res => res.json())
        .then(data => {
          setPromptInfo(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch prompt info:', err);
          setLoading(false);
        });
    }
  }, [isOpen, promptInfo]);

  const renderTrigger = () => {
    if (variant === 'prominent') {
      return (
        <button
          className="how-it-works-btn"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Learn how it works
        </button>
      );
    }

    return (
      <button
        className="how-it-works-link"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        How does this work?
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>How This App Works</h2>
              <button className="modal-close" onClick={() => setIsOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-tabs">
              <button
                className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`modal-tab ${activeTab === 'prompt' ? 'active' : ''}`}
                onClick={() => setActiveTab('prompt')}
              >
                View Prompt
              </button>
              <button
                className={`modal-tab ${activeTab === 'inputs' ? 'active' : ''}`}
                onClick={() => setActiveTab('inputs')}
              >
                Your Inputs
              </button>
            </div>

            <div className="modal-body">
              {activeTab === 'overview' && (
                <div className="tab-content">
                  <div className="pipeline-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>News Gathering</h3>
                      <p>
                        When you enter a company name, we search for recent news articles
                        from your preferred financial news sources (WSJ, Bloomberg, Reuters, etc.).
                        This gives us current context about what investors and analysts are
                        saying about the company.
                      </p>
                    </div>
                  </div>

                  <div className="pipeline-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>AI Synthesis</h3>
                      <p>
                        We send the news articles along with your inputs (contact name,
                        tone preference, etc.) to Claude, an AI assistant. Claude analyzes
                        the news to identify key investor concerns and market themes
                        relevant to the company.
                      </p>
                    </div>
                  </div>

                  <div className="pipeline-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>Email Generation</h3>
                      <p>
                        Using a carefully crafted prompt, Claude generates a personalized
                        outreach email that references the company's current situation
                        and positions your firm's IR services as a solution. The email is
                        designed to sound natural, not AI-generated.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'prompt' && (
                <div className="tab-content">
                  {loading ? (
                    <div className="loading-prompt">Loading prompt...</div>
                  ) : promptInfo ? (
                    <>
                      <p className="prompt-intro">
                        This is the base prompt template we send to Claude. Your inputs
                        and the fetched news articles are added to this template.
                      </p>
                      <div className="prompt-display">
                        <pre>{promptInfo.basePrompt}</pre>
                      </div>
                      <p className="prompt-note">
                        Additional modifiers for tone, role, length, relationship, and structure are appended based
                        on your selections.
                      </p>
                    </>
                  ) : (
                    <p>Failed to load prompt information.</p>
                  )}
                </div>
              )}

              {activeTab === 'inputs' && (
                <div className="tab-content">
                  <p className="inputs-intro">
                    The information you provide in the form is incorporated into the prompt
                    to personalize each email. Here's how each field is used:
                  </p>

                  {loading ? (
                    <div className="loading-prompt">Loading...</div>
                  ) : promptInfo ? (
                    <>
                      <div className="input-list">
                        {promptInfo.dynamicInputs.map(input => (
                          <div key={input.name} className="input-item">
                            <code>{input.name}</code>
                            <span>{input.description}</span>
                          </div>
                        ))}
                      </div>

                      <h4>Tone Options</h4>
                      <div className="modifier-list">
                        {Object.entries(promptInfo.toneModifiers).map(([key, value]) => (
                          <div key={key} className="modifier-item">
                            <strong>{key}</strong>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>

                      <h4>Role Context</h4>
                      <div className="modifier-list">
                        {Object.entries(promptInfo.roleContext).map(([key, value]) => (
                          <div key={key} className="modifier-item">
                            <strong>{key.toUpperCase()}</strong>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>

                      <h4>Length Options</h4>
                      <div className="modifier-list">
                        {Object.entries(promptInfo.lengthModifiers).map(([key, value]) => (
                          <div key={key} className="modifier-item">
                            <strong>{key}</strong>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>

                      <h4>Relationship Options</h4>
                      <div className="modifier-list">
                        {Object.entries(promptInfo.relationshipModifiers).map(([key, value]) => (
                          <div key={key} className="modifier-item">
                            <strong>{key}</strong>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>

                      <h4>Structure Options</h4>
                      <div className="modifier-list">
                        {promptInfo.structureModifiers && Object.entries(promptInfo.structureModifiers).map(([key, value]) => (
                          <div key={key} className="modifier-item">
                            <strong>{key}</strong>
                            <span>{value.emailStructure}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>Failed to load input information.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
