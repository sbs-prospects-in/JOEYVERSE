import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Syringe, Ambulance, BookOpen, ShieldAlert } from 'lucide-react';
import { staggerContainer, fadeUp } from '../../lib/motion';

export default function ProgramAreas() {
  const programs = [
    {
      icon: Heart,
      title: 'Daily Feeding Operations',
      subtitle: 'Nutritional Support',
      desc: 'We operate a dedicated community kitchen that cooks fresh, healthy rice and protein mixtures starting at 5:00 AM daily. Our routes cover 12 municipal wards, delivering meals to over 500 street dogs at designated points, maintaining nutritional balance and reducing hunger-based disputes.'
    },
    {
      icon: Ambulance,
      title: 'Emergency Medical Rescue',
      subtitle: 'Veterinary Response',
      desc: 'Our rescue team responds to reports of injured, sick, or traumatized community animals. Partnering with local animal hospitals and mobile vets, we transport animals for treatment, fund orthopedic surgeries, and provide post-operative shelter and physical therapy.'
    },
    {
      icon: Syringe,
      title: 'Anti-Rabies Vaccination (ARV)',
      subtitle: 'Preventive Care',
      desc: 'Streets are safer when they are vaccinated. We run coordinated campaigns administering Anti-Rabies Vaccinations (ARV) and deworming treatments. By keeping local dog packs rabies-free, we protect both the animals and the human community from transmission risk.'
    },
    {
      icon: BookOpen,
      title: 'Community Coexistence Awareness',
      subtitle: 'Educational Outreach',
      desc: 'Conflicts between street dogs and residents often stem from fear or misinformation. We conduct neighborhood workshops, distribute informational safety guides for festivals (Diwali firecrackers, Holi colors), and educate residents on Animal Welfare Board of India guidelines.'
    },
    {
      icon: ShieldAlert,
      title: 'Legal Advocacy & Feeders\' Protection',
      subtitle: 'Rights Enforcement',
      desc: 'Under Indian law, community animals have the right to exist, and feeders have the legal right to feed them. Our legal advocacy team protects feeders from harassment, files petitions against housing society illegal bans, and demands accountability from local municipal bodies.'
    }
  ];

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="space-y-16"
    >
      {programs.map((program, idx) => {
        const Icon = program.icon;
        const isEven = idx % 2 === 0;

        return (
          <motion.div 
            key={idx}
            variants={fadeUp}
            className={`flex flex-col lg:flex-row gap-8 items-start justify-between border-b border-gray-100 pb-16 last:border-b-0 ${
              isEven ? '' : 'lg:flex-row-reverse'
            }`}
          >
            {/* Header / Meta Block */}
            <div className="lg:w-1/3 space-y-3">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase block">
                {program.subtitle}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight flex items-center gap-2">
                <Icon size={22} className="text-primary shrink-0" />
                {program.title}
              </h3>
            </div>

            {/* Description Narrative */}
            <div className="lg:w-2/3">
              <p className="text-gray-500 text-sm md:text-base leading-relaxed font-light">
                {program.desc}
              </p>
            </div>

          </motion.div>
        );
      })}
    </motion.div>
  );
}
