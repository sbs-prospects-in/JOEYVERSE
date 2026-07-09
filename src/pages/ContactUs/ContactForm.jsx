import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../lib/axiosClient';
import Button from '../../components/ui/Button';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!formData.message.trim()) newErrors.message = 'Message content is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please correct the validation errors in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/contact', formData);
      toast.success(res.data.message || 'Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
          className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-100 transition-colors ${
            errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary'
          }`}
          placeholder="Enter your name"
        />
        {errors.name && <span className="text-xs text-red-500 font-medium mt-1 block">{errors.name}</span>}
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
          Your Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-100 transition-colors ${
            errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary'
          }`}
          placeholder="Enter your email"
        />
        {errors.email && <span className="text-xs text-red-500 font-medium mt-1 block">{errors.email}</span>}
      </div>

      {/* Subject Input */}
      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          disabled={isSubmitting}
          className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-100 transition-colors ${
            errors.subject ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary'
          }`}
          placeholder="What is this regarding?"
        />
        {errors.subject && <span className="text-xs text-red-500 font-medium mt-1 block">{errors.subject}</span>}
      </div>

      {/* Message Input */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          disabled={isSubmitting}
          className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-100 transition-colors resize-none ${
            errors.message ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary'
          }`}
          placeholder="Write your message here..."
        />
        {errors.message && <span className="text-xs text-red-500 font-medium mt-1 block">{errors.message}</span>}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        variant="primary" 
        disabled={isSubmitting} 
        className="w-full py-4 text-center justify-center font-bold"
      >
        {isSubmitting ? 'Sending Message...' : 'Send Message'}
      </Button>

    </form>
  );
}
