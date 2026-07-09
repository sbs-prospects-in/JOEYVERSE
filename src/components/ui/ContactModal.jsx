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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitted(true);
    }
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none flex items-end md:items-center justify-center p-0 md:p-8"
    >
      <div 
        ref={containerRef}
        className="w-full max-w-[1440px] h-[90vh] md:h-auto md:max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-t-3xl md:rounded-2xl overflow-y-auto translate-y-full relative flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button 
          onClick={closeContact}
          className="absolute top-6 right-6 md:top-8 md:right-8 z-50 text-white/50 hover:text-white transition-colors p-2"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-16 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} ref={el => contentRefs.current[0] = el} className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#bd905b] mb-4 block">Get in Touch</span>
                <h2 className="text-4xl md:text-5xl font-light mb-6">Contact <span className="font-bold">Us</span></h2>
                <p className="body-standard opacity-60 max-w-md mb-8">
                  Whether you want to volunteer, adopt a stray, or ask a question, we are here to listen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs uppercase tracking-widest text-white/50">Full Name *</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-sm text-sm outline-none transition-colors text-white"
                  />
                  {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs uppercase tracking-widest text-white/50">Email Address *</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-sm text-sm outline-none transition-colors text-white"
                  />
                  {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-xs uppercase tracking-widest text-white/50">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-sm text-sm outline-none transition-colors text-white"
                  />
                  {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                </div>

                {/* Inquiry Type */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="inquiryType" className="text-xs uppercase tracking-widest text-white/50">Inquiry Type</label>
                  <select 
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-sm text-sm outline-none transition-colors text-white cursor-pointer"
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
                <label htmlFor="message" className="text-xs uppercase tracking-widest text-white/50">Your Message *</label>
                <textarea 
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-sm text-sm outline-none transition-colors text-white resize-none"
                />
                {errors.message && <span className="text-xs text-red-500">{errors.message}</span>}
              </div>

              <button 
                type="submit" 
                className="w-full py-5 bg-[#F7F7F7] text-black font-medium tracking-widest uppercase hover:bg-[#bd905b] hover:text-white transition-colors duration-300 rounded-sm"
              >
                Send Message
              </button>
            </form>
          ) : (
            <div ref={el => contentRefs.current[0] = el} className="text-center py-16 flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 rounded-full border border-green-500 flex items-center justify-center text-green-500 mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="text-3xl font-light">Message Sent!</h2>
              <p className="body-standard opacity-60 max-w-md">
                Thank you for reaching out, {formData.name}. Our team will review your inquiry and get back to you within 24–48 hours.
              </p>
              <button 
                onClick={closeContact}
                className="px-8 py-3 border border-white/20 hover:border-white text-white font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 rounded-sm mt-8"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Information */}
        <div className="flex-1 p-8 md:p-16 bg-[#111111] flex flex-col justify-center space-y-12">
          <div ref={el => contentRefs.current[1] = el} className="space-y-8">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2 block">Direct Contact</span>
              <h3 className="text-2xl font-light text-[#bd905b]">beingkind.india@gmail.com</h3>
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2 block">Our Base</span>
              <p className="body-standard text-white/80">
                Mumbai, Maharashtra, India
              </p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2 block">Social Channels</span>
              <div className="flex gap-6 mt-4">
                <a 
                  href="https://www.instagram.com/beingkind_india/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/60 hover:text-[#bd905b] transition-colors uppercase tracking-widest text-xs border-b border-white/10 pb-1"
                >
                  Instagram
                </a>
                <a 
                  href="mailto:beingkind.india@gmail.com" 
                  className="text-white/60 hover:text-[#bd905b] transition-colors uppercase tracking-widest text-xs border-b border-white/10 pb-1"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
