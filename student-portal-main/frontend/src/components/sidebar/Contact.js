import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! (This is a demo)');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <header className="page-header">
        <h1>Contact Us</h1>
        <p className="lead">We'd love to hear from you — let’s connect!</p>
      </header>

      <div className="contact-grid">
        <div className="contact-info">
          <h3>Our Office</h3>
          <p><strong>Address:</strong> MD Plaza Basement, Canal Road, near Canal View Hotel, Rahim Yar Khan</p>
          <p><strong>Phone:</strong> 0302-8882969</p>
          <p><strong>Email:</strong> itcentreryk@gmail.com</p>
          <p><strong>Website:</strong> <a href="https://www.itcentre.pk" target="_blank" rel="noopener noreferrer">www.itcentre.pk</a></p>

          <h3>Find Us Online</h3>
          <ul className="social-links">
            <li><a href="https://www.facebook.com/ITCentreRYK" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://www.instagram.com/itcentreryk/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://twitter.com/rahim_it" target="_blank" rel="noopener noreferrer">Twitter (X)</a></li>
            <li><a href="https://www.linkedin.com/company/itcentre-ryk" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="https://www.youtube.com/@itcentrery" target="_blank" rel="noopener noreferrer">YouTube</a></li>
          </ul>
        </div>

        <div className="contact-form">
          <h3>Send Us a Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Your Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Your Message</label>
              <textarea name="message" rows="5" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
