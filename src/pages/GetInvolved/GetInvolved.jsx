import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Heart, Users, HandHelping, Landmark } from 'lucide-react';
import SectionHeading from '../../components/ui/SectionHeading';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import api from '../../lib/axiosClient';

export default function GetInvolved() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: 'feeding',
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
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else {
      const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix form validation errors.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/volunteer', formData);
      toast.success(res.data.message || 'Application submitted! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', interests: 'feeding', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const waysToHelp = [
    {
      icon: Heart,
      title: 'Make a Donation',
      desc: 'Your financial support pays for feeding ingredients, vaccines, and life-saving veterinary operations. Every dollar feeds a street dog for a week.',
      actionText: 'Donate Securely via Razorpay',
      actionUrl: 'https://razorpay.com' // Mock redirect
    },
    {
      icon: HandHelping,
      title: 'Fundraise for Strays',
      desc: 'Celebrate birthdays, run marathons, or host school workshops. Set up a campaign to raise funds for Being Kind drives.',
      actionText: 'Start a Campaign',
      actionUrl: '/campaigns-advocacy'
    },
    {
      icon: Landmark,
      title: 'Corporate Partnerships',
      desc: 'Collaborate under Corporate Social Responsibility (CSR) initiatives. We partner with firms to run vaccine drives and build feeding programs.',
      actionText: 'Partner With Us',
      actionUrl: '/contact-us'
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-white">
      
      {/* 1. Header Banner */}
      <section className="py-16 bg-neutral-bg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Join the Movement of Compassion" 
            subtitle="Get Involved"
            align="left"
          />
          <p className="max-w-3xl text-gray-500 text-lg md:text-xl font-light leading-relaxed">
            There are many ways to support our mission. Whether you donate financially, volunteer on the streets, or advocate for feeding rights, you make a difference.
          </p>
        </div>
      </section>

      {/* 2. Ways to Help (Asymmetric / Zig-zag grid) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-24">
          {waysToHelp.map((item, idx) => {
            const Icon = item.icon;
            const isEven = idx % 2 === 0;

            return (
              <div 
                key={idx} 
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content block */}
                <div className={`lg:col-span-6 space-y-6 ${!isEven && 'lg:order-2'}`}>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">{item.title}</h3>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">{item.desc}</p>
                  
                  <div className="pt-2">
                    {item.actionUrl.startsWith('http') ? (
                      <a href={item.actionUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="primary">{item.actionText}</Button>
                      </a>
                    ) : (
                      <a href={item.actionUrl}>
                        <Button variant="primary">{item.actionText}</Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Styled illustration / background mockup block */}
                <div className={`lg:col-span-6 ${!isEven && 'lg:order-1'}`}>
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-bg border border-gray-100 flex items-center justify-center p-8 relative">
                    <div className="absolute top-6 left-6 w-24 h-24 bg-orange-100/50 rounded-full blur-xl -z-10" />
                    <div className="text-center max-w-sm space-y-4">
                      <span className="text-6xl text-primary font-bold">BK</span>
                      <h4 className="text-lg font-bold text-gray-900 uppercase tracking-widest">{item.title} Portal</h4>
                      <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
                      <p className="text-xs text-gray-400">Secure, encrypted transactions & direct impact tracking</p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Volunteer Application Form Section */}
      <section className="py-24 bg-neutral-bg border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Info Panel */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-sm font-semibold tracking-wider text-primary uppercase block">On-the-ground</span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                Become a Volunteer
              </h2>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                Be the hands and legs of our operations. We need volunteers for:
              </p>
              <ul className="space-y-3.5 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Daily feeding cooks and drivers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Anti-rabies vaccination catching assistants
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  On-street emergency rescue responders
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Legal advocacy and public awareness campaigners
                </li>
              </ul>
            </div>

            {/* Form Panel */}
            <div className="lg:col-span-7 bg-white border border-gray-100 p-8 md:p-12 rounded-3xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Volunteer Sign-up</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="vol-name" className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="vol-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-orange-100"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="vol-email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="vol-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-orange-100"
                      placeholder="Your email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="vol-phone" className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="vol-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-orange-100"
                      placeholder="Your phone"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="vol-interests" className="block text-sm font-semibold text-gray-700 mb-1">Area of Interest</label>
                    <select
                      id="vol-interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="feeding">Daily Feeding Drives</option>
                      <option value="rescue">Medical Rescues</option>
                      <option value="vaccinations">Anti-Rabies Campaigns</option>
                      <option value="advocacy">Legal & Awareness campaigns</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="vol-message" className="block text-sm font-semibold text-gray-700 mb-1">About Yourself</label>
                  <textarea
                    id="vol-message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-orange-100 resize-none"
                    placeholder="Tell us why you want to join and any relevant experience..."
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting} 
                  className="w-full py-4 text-center justify-center font-bold"
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
