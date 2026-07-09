import React from 'react';
import SectionHeading from '../../components/ui/SectionHeading';
import ProgramAreas from './ProgramAreas';
import ImpactChart from './ImpactChart';
import Card from '../../components/ui/Card';

export default function OurWork() {
  const sponsors = [
    { name: 'Animal Welfare Trust' },
    { name: 'Ahmedabad Vet Care' },
    { name: 'Compassion India' },
    { name: 'Stray Safe Foundation' }
  ];

  return (
    <div className="pt-24 min-h-screen bg-white">
      
      {/* 1. Header Banner */}
      <section className="py-16 bg-neutral-bg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Protecting and Sustaining Street Lives" 
            subtitle="Our Work"
            align="left"
          />
          <p className="max-w-3xl text-gray-500 text-lg md:text-xl font-light leading-relaxed">
            Our multi-pronged approach tackles hunger, disease, legal protection, and neighborhood co-existence directly on Ahmedabad's streets.
          </p>
        </div>
      </section>

      {/* 2. Core Program Areas */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProgramAreas />
      </section>

      {/* 3. Dark Chapter Break: Impact Metrics Visualized */}
      <section className="py-24 bg-primary-dark text-white border-t border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Allocation & Impact Visualized" 
            subtitle="Audited Performance" 
            align="center"
            className="text-white mb-16"
          />
          
          {/* Recharts Pie and Bar charts wrapper */}
          <ImpactChart />
        </div>
      </section>

      {/* 4. Partner / Sponsor Logos Strip (Logo-only wall, no category headers) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-10">Supporting Partners</span>
          
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 grayscale opacity-50 hover:opacity-75 transition-opacity duration-300">
            {sponsors.map((sponsor, idx) => (
              <div key={idx} className="flex items-center gap-2 font-bold text-gray-800 text-lg tracking-wider">
                <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">BK</span>
                <span>{sponsor.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
