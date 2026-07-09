import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import SectionHeading from '../../components/ui/SectionHeading';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CAMPAIGNS } from '../../data/campaigns';
import { staggerContainer, fadeUp } from '../../lib/motion';

export default function CampaignsAdvocacy() {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Active', 'Upcoming', 'Completed'];

  const filteredCampaigns = CAMPAIGNS.filter((campaign) => {
    return activeTab === 'All' || campaign.status === activeTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-white">
      
      {/* 1. Header Banner */}
      <section className="py-16 bg-neutral-bg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Standing Up for Stray Rights" 
            subtitle="Campaigns & Advocacy"
            align="left"
          />
          <p className="max-w-3xl text-gray-500 text-lg md:text-xl font-light leading-relaxed">
            We drive local, legal, and national awareness campaigns to protect community feeders and stop unscientific roundups. Explore our campaigns below.
          </p>
        </div>
      </section>

      {/* 2. Tabs */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 border-b border-gray-100 pb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Campaign Lists */}
      <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredCampaigns.length > 0 ? (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCampaigns.map((campaign) => (
              <motion.div key={campaign.id} variants={fadeUp}>
                <Link to={`/campaigns-advocacy/${campaign.slug}`} className="block h-full">
                  <Card className="flex flex-col h-full cursor-pointer group">
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <img 
                        src="/src/assets/images/hero_bg.png" 
                        alt={campaign.title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full uppercase shadow-xs ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-primary transition-colors">
                          {campaign.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                          {campaign.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-primary font-bold tracking-wider flex items-center gap-1">
                          VIEW DETAILS <ArrowRight size={14} />
                        </span>
                        
                        {campaign.status === 'Completed' && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
                            <ShieldCheck size={14} /> VICTORY
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-neutral-bg rounded-3xl border border-gray-100">
            <p className="text-gray-400 text-lg">No campaigns found under this filter.</p>
          </div>
        )}
      </section>

    </div>
  );
}
