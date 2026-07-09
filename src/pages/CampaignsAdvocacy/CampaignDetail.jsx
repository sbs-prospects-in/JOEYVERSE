import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Share2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CAMPAIGNS } from '../../data/campaigns';
import CampaignProgressChart from './CampaignProgressChart';
import Button from '../../components/ui/Button';
import api from '../../lib/axiosClient';

export default function CampaignDetail() {
  const { slug } = useParams();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const campaign = CAMPAIGNS.find((c) => c.slug === slug);

  if (!campaign) {
    return (
      <div className="pt-32 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Campaign Not Found</h2>
        <p className="text-gray-500 mb-8">The campaign you are looking for does not exist or has closed.</p>
        <Link to="/campaigns-advocacy">
          <Button variant="primary">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignPetition = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please enter your name and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate endpoint call
      const res = await api.post('/contact', formData);
      toast.success(res.data.message || 'Thank you for signing the petition!');
      setIsSigned(true);
      setFormData({ name: '', email: '' });
    } catch (err) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Campaign link copied to clipboard!');
  };

  return (
    <div className="pt-24 min-h-screen bg-white">
      
      {/* 1. Header & Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link 
          to="/campaigns-advocacy" 
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-primary hover:underline mb-8"
        >
          <ArrowLeft size={16} /> BACK TO CAMPAIGNS
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase shadow-xs ${
            campaign.status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : campaign.status === 'Upcoming' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-700'
          }`}>
            {campaign.status}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-8">
          {campaign.title}
        </h1>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Narrative Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-video rounded-3xl overflow-hidden bg-gray-100 mb-8">
              <img 
                src="/src/assets/images/hero_bg.png" 
                alt={campaign.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed text-base md:text-lg font-light space-y-6">
              {campaign.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Action Center & Goals (Sticky panel) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28 bg-neutral-bg border border-gray-100 rounded-3xl p-8 shadow-xs">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Info size={20} className="text-primary" /> Action Center
              </h3>
              <p className="text-xs text-gray-500">
                Join others in supporting this campaign to drive policy change.
              </p>
            </div>

            {/* Recharts progress visualizer */}
            {campaign.goal > 0 && (
              <CampaignProgressChart 
                current={isSigned ? campaign.current + 1 : campaign.current} 
                goal={campaign.goal} 
                label={campaign.goalLabel}
              />
            )}

            {/* Dynamic Sign Petition form */}
            {campaign.status === 'Active' && (
              <div className="border-t border-gray-200/60 pt-6">
                {isSigned ? (
                  <div className="text-center py-6 space-y-3">
                    <CheckCircle className="text-green-500 w-12 h-12 mx-auto" />
                    <h4 className="font-bold text-gray-900 text-lg">Thank You for Supporting!</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Your voice has been added to our Supreme Court legal submission files.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSignPetition} className="space-y-4">
                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-2">Sign the Petition</h4>
                    
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-orange-100"
                      required
                    />
                    
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Your Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-orange-100"
                      required
                    />

                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={isSubmitting}
                      className="w-full py-3.5"
                    >
                      {isSubmitting ? 'Signing...' : 'Sign Petition'}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {campaign.status === 'Upcoming' && (
              <div className="border-t border-gray-200/60 pt-6 text-center py-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider mb-1">Campaign Launching Soon</h4>
                <p className="text-xs text-blue-700 leading-relaxed max-w-xs mx-auto">
                  This campaign is currently in preparation. Check back on launch date to participate.
                </p>
              </div>
            )}

            {/* Sharing Action */}
            <div className="border-t border-gray-200/60 pt-6">
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 border-gray-300 py-3.5 hover:bg-gray-50"
              >
                <Share2 size={16} /> Share Campaign
              </Button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
