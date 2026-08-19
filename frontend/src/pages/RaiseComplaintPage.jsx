import React, { useState } from 'react';
import { AlertCircle, Mail, Paperclip, Send, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './RaiseComplaintPage.css';

export default function RaiseComplaintPage() {
  const { user } = useAuth();
  const [senderName, setSenderName] = useState(user?.full_name || '');
  const [senderEmail, setSenderEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || subject === 'Select issue type') {
      setErrorMsg('Please select a valid subject / issue type.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please write details about your issue or complaint.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const formData = new FormData();
      if (senderName) formData.append('sender_name', senderName);
      if (senderEmail) formData.append('sender_email', senderEmail);
      formData.append('subject', subject);
      formData.append('message', message);
      if (attachment) formData.append('attachment', attachment);

      const res = await fetch('http://127.0.0.1:8000/api/v1/complaints/', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to submit complaint. Please try again.');
      }

      const data = await res.json();
      setSuccessMsg(`Complaint #${data.id} submitted successfully! Delivered directly to ${data.target_email}.`);
      setSubject('');
      setMessage('');
      setAttachment(null);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong while submitting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-page-container">
      <div className="complaint-card-wrapper">
        
        {/* 1. Header Banner */}
        <div className="complaint-header-banner">
          <div className="banner-left">
            <div className="alert-icon-box">
              <AlertCircle size={24} />
            </div>
            <div>
              <h1 className="banner-title">Raise Complaint</h1>
              <p className="banner-subtitle">Let us know your issue — we will get back to you shortly.</p>
            </div>
          </div>

          <div className="admin-email-badge">
            <div className="badge-icon-box">
              <Mail size={18} />
            </div>
            <div className="badge-text-box">
              <span className="badge-label">Complaints sent directly to:</span>
              <span className="badge-email">chandan.rai771714@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="alert-success-box">
            <CheckCircle2 size={20} /> {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert-error-box">
            <AlertCircle size={20} /> {errorMsg}
          </div>
        )}

        {/* 2. Complaint Form */}
        <form onSubmit={handleSubmit} className="complaint-form">
          
          <div className="form-row-two-col">
            <div className="form-group">
              <label htmlFor="complaint-sender-name" className="field-label">Your Name (Optional)</label>
              <input 
                id="complaint-sender-name"
                type="text" 
                className="field-input" 
                placeholder="Enter your name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="complaint-sender-email" className="field-label">Your Email (Optional)</label>
              <input 
                id="complaint-sender-email"
                type="email" 
                className="field-input" 
                placeholder="Enter your email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="complaint-subject" className="field-label">Subject</label>
            <select 
              id="complaint-subject"
              className="field-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            >
              <option value="">Select issue type</option>
              <option value="AI Book Editor Issue">AI Book Editor & Audit Issue</option>
              <option value="Document Upload & OCR Issue">Document Upload & OCR Parser Issue</option>
              <option value="Publisher Finder & Maps Issue">Publisher Finder & Google Maps Issue</option>
              <option value="Reader Mode & Highlights Issue">Reader Mode & Study Tools Issue</option>
              <option value="Account & Security Question">Account & Security Question</option>
              <option value="General Platform Complaint">General Platform Complaint</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="complaint-message" className="field-label">Message / Complaint</label>
            <textarea 
              id="complaint-message"
              className="field-textarea"
              rows={6}
              placeholder="Write your complaint or issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Attachments & Submit Action Row */}
          <div className="form-actions-row">
            <div className="attachment-picker-group">
              <label className="file-input-btn">
                <Paperclip size={18} />
                {attachment ? attachment.name : 'Attach Files (PDF, Image, etc.)'}
                <input 
                  type="file" 
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachment(e.target.files[0]);
                    }
                  }}
                />
              </label>
              <span className="file-size-hint">Max 10MB per file</span>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-submit-complaint"
            >
              <Send size={18} /> {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>

        </form>

        {/* 3. Information Notice Footer */}
        <div className="complaint-footer-info">
          <div className="info-icon-badge">
            <Info size={18} />
          </div>
          <span>Your complaint will be received directly in our admin email and handled by the team.</span>
        </div>

      </div>
    </div>
  );
}
