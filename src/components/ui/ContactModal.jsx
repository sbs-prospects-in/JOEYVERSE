import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useModal } from '../../context/ModalContext';

export default function ContactModal() {
  const { isContactOpen, contactType, closeContact } = useModal();
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const contentRefs = useRef([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isContactOpen) {
      document.body.style.overflow = 'hidden';
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: contactType,
        message: ''
      });
      setErrors({});

      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.5,
        ease: 'power3.inOut'
      });
      
      gsap.to(containerRef.current, {
        y: '0%',
        duration: 0.8,
        ease: 'power4.out',
        delay: 0.1
      });

      gsap.fromTo(contentRefs.current, 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.4 }
      );
    } else {
      document.body.style.overflow = 'auto';
      
      gsap.to(containerRef.current, {
        y: '100%',
        duration: 0.6,
        ease: 'power3.inOut'
      });
      
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.4,
        ease: 'power3.inOut',
        delay: 0.3
      });
    }
  }, [isContactOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^\+?[0-9\s-]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // IMPORTANT: Replace this with your Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNwbiFfuYwF_B6__mhyyJociuiUOwDl0lUiLSkPMJ8LHXC_I_WSsQ7oGYH4cPCzhRDpQ/exec';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Essential for Google Apps Script to avoid CORS errors
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        // Because of no-cors, we can't read the response properly, so we assume success if no error was thrown
        setIsSubmitted(true);
      } catch (error) {
        console.error('Error submitting form:', error);
        setSubmitError('Failed to send message. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none flex items-end md:items-center justify-center p-0 md:p-8"
    >
      <div 
        ref={containerRef}
        className="w-full max-w-[1100px] h-[90vh] md:h-auto md:max-h-[90vh] bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-y-auto translate-y-full relative flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button 
          onClick={closeContact}
          className="absolute top-6 right-6 md:top-8 md:right-8 z-50 text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors p-2"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} ref={el => contentRefs.current[0] = el} className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#16a34a] mb-3 block flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> Get in Touch
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Contact <span className="text-[#f2687c]">Us</span></h2>
                <p className="text-slate-600 max-w-md mb-8">
                  Whether you want to volunteer, adopt a stray, or ask a question, we are here to listen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Full Name *</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 focus:bg-white px-4 py-3.5 rounded-xl text-sm outline-none transition-all text-slate-900 font-medium"
                  />
                  {errors.name && <span className="text-xs text-red-500 font-medium">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email Address *</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 focus:bg-white px-4 py-3.5 rounded-xl text-sm outline-none transition-all text-slate-900 font-medium"
                  />
                  {errors.email && <span className="text-xs text-red-500 font-medium">{errors.email}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 focus:bg-white px-4 py-3.5 rounded-xl text-sm outline-none transition-all text-slate-900 font-medium"
                  />
                  {errors.phone && <span className="text-xs text-red-500 font-medium">{errors.phone}</span>}
                </div>

                {/* Inquiry Type */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="inquiryType" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Inquiry Type</label>
                  <select 
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 focus:bg-white px-4 py-3.5 rounded-xl text-sm outline-none transition-all text-slate-900 cursor-pointer font-medium"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="volunteer">Volunteering</option>
                    <option value="adoption">Adoption / Fostering</option>
                    <option value="donation">Donation Queries</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Your Message *</label>
                <textarea 
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 focus:bg-white px-4 py-3.5 rounded-xl text-sm outline-none transition-all text-slate-900 resize-none font-medium"
                />
                {errors.message && <span className="text-xs text-red-500 font-medium">{errors.message}</span>}
              </div>

              {submitError && (
                <div className="text-red-500 text-sm mt-2">{submitError}</div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`group relative overflow-hidden bg-gradient-to-r from-[#f2687c] to-amber-500 text-white w-full sm:w-auto px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest mt-8 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-[#f2687c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
              </button>
            </form>
          ) : (
            <div ref={el => contentRefs.current[0] = el} className="text-center py-16 flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900">Message Sent!</h2>
              <p className="text-slate-600 max-w-md">
                Thank you for reaching out, <span className="font-bold text-slate-900">{formData.name}</span>. Our team will review your inquiry and get back to you within 24–48 hours.
              </p>
              <button 
                onClick={closeContact}
                className="px-10 py-4 bg-slate-900 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-rose-500 transition-colors shadow-md mt-6"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Information */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 bg-slate-50 md:rounded-br-[2.5rem] flex flex-col justify-center space-y-12">
          <div ref={el => contentRefs.current[1] = el} className="space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Direct Contact</span>
              <a href="mailto:joeyverse2025@gmail.com" className="text-xl md:text-2xl font-bold text-rose-500 hover:text-rose-600 transition-colors block break-all">
                joeyverse2025@gmail.com
              </a>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Our Base</span>
              <a 
                href="https://maps.google.com/?q=1003,+Span+Trade+Center,+Paldi,+Ahmedabad" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-700 font-medium leading-relaxed hover:text-rose-600 transition-colors block"
              >
                1003, Span Trade Center, <br/>
                Paldi, Ahmedabad
              </a>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block pl-2">Social Channels</span>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/beingkind_india/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                  aria-label="Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a 
                  href="mailto:joeyverse2025@gmail.com" 
                  className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200 transition-all shadow-sm"
                  aria-label="Email"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
