import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/motion';

export default function AboutTimeline() {
  const milestones = [
    {
      year: '2023',
      title: 'Humble Beginnings',
      desc: 'Began cooking and distributing healthy meals to a single pack of 20 dogs in Makarba. Noticed immediate improvement in community relations and animal wellness.'
    },
    {
      year: '2024',
      title: 'Official Incorporation & Rescue Ops',
      desc: 'Formally registered Being Kind as a nonprofit. Leased our first community kitchen space and partnered with local vets to start emergency medical rescues.'
    },
    {
      year: '2025',
      title: 'Anti-Rabies Drive & Legal Advocacy',
      desc: 'Launched the ARV campaign, vaccinating 500+ dogs. Drafted the "Animal Writes 2025" Supreme Court petition to protect animal feeders\' rights.'
    },
    {
      year: '2026',
      title: 'Expanding Our Reach',
      desc: 'Scaling feeding operations to 500+ dogs daily across Ahmedabad and standing up against unauthorized municipal roundups.'
    }
  ];

  return (
    <div className="relative border-l border-orange-200 ml-4 md:ml-1/2 space-y-12 py-8">
      {milestones.map((item, idx) => (
        <motion.div
          key={idx}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          variants={fadeUp}
          className={`relative pl-8 md:pl-0 md:w-1/2 md:translate-x-[-100%] md:pr-12 md:text-right ${
            idx % 2 !== 0 ? 'md:translate-x-[100%] md:pl-12 md:pr-0 md:text-left border-l-0!' : ''
          }`}
        >
          {/* Timeline Node dot */}
          <div className={`absolute top-1.5 left-0 -translate-x-[5px] w-2.5 h-2.5 rounded-full bg-primary border-2 border-white md:left-auto md:right-0 md:translate-x-[5px] ${
            idx % 2 !== 0 ? 'md:left-0 md:right-auto md:-translate-x-[5px]' : ''
          }`} />

          {/* Timeline details */}
          <div className="bg-neutral-bg p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
            <span className="text-sm font-bold text-primary block mb-1">{item.year}</span>
            <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
