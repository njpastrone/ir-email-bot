import { useState } from 'react';

export default function EmailForm({ settings, onGenerate, isLoading }) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    senderName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      ...formData,
      firmName: settings.firmName,
      preferredSources: settings.preferredSources
    });
  };

  const isValid = formData.companyName && formData.contactName && formData.senderName;

  return (
    <div className="card">
      <h2>Generate Email</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="companyName">Company Name or Ticker</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g., Apple or AAPL"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactName">Contact Name</label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="e.g., John Smith"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="senderName">Your First Name (for sign-off)</label>
          <input
            type="text"
            id="senderName"
            name="senderName"
            value={formData.senderName}
            onChange={handleChange}
            placeholder="e.g., Sarah"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="primary"
          disabled={!isValid || isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Email'}
        </button>
      </form>
    </div>
  );
}
