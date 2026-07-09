import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Users, Award } from 'lucide-react';
import SectionHeading from '../../components/ui/SectionHeading';
import AboutTimeline from './AboutTimeline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { staggerContainer, fadeUp } from '../../lib/motion';

export default function AboutUs() {
  const team = [
    {
      name: 'Shikha',
      role: 'Founder & Head Feeder',
      desc: 'Advocate for feeders\' rights, orchestrates daily feeding drives, and coordinates rescue networks in Ahmedabad.'
    },
    {
      name: 'Dr. Vivek Patel',
      role: 'Veterinary Advisor',
      desc: 'Oversees vaccination schedules and provides veterinary medical assistance to rescued street animals.'
    },
    {
      name: 'Rohan Sharma',
      role: 'Legal Lead',
      desc: 'Specializes in animal welfare legislation, driving our petitions and representing community feeders.'
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-white">
      
      {/* 1. Header Banner */}
      <section className="py-16 bg-neutral-bg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Who We Are & Why We Protect" 
            subtitle="About Us"
            align="left"
          />
          <p className="max-w-3xl text-gray-500 text-lg md:text-xl font-light leading-relaxed">
            Being Kind is a grassroots animal welfare organization dedicated to street animals in Ahmedabad, India. We believe in co-existence, compassion, and the fundamental right of every community animal to live free from violence.
          </p>
        </div>
      </section>

      {/* 2. Mission & Values */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="text-primary" /> Our Mission
            </h3>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              To create an environment where street animals are healthy, fed, vaccinated, and protected by law, establishing a peaceful co-existence between human neighborhoods and community animals.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-primary" /> Our Vision
            </h3>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              A city where no stray animal dies of hunger, treatable medical conditions, or human cruelty, and where local communities actively participate in protecting and feeding their street animals.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Timeline of Milestones */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Our Journey" 
            subtitle="Timeline" 
            align="center"
          />
          <AboutTimeline />
        </div>
      </section>

      {/* 4. Leadership & Team */}
      <section className="py-24 bg-neutral-bg border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="People Behind the Cause" 
            subtitle="Our Team" 
            align="center"
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {team.map((member, idx) => (
              <motion.div key={idx} variants={fadeUp}>
                <Card className="p-8 h-full bg-white flex flex-col justify-between items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 text-primary font-bold text-xl flex items-center justify-center mb-6">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                    <span className="text-xs text-primary uppercase font-bold tracking-wider block mb-4">{member.role}</span>
                    <p className="text-gray-500 text-sm leading-relaxed">{member.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Trust & Transparency */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="text-primary" /> Credibility & Transparency
            </h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Being Kind is registered as a Section 8 Non-Profit organization in India. Registration Number: <span className="font-semibold text-gray-800">Section-8-BK-78452-IND</span>. All contributions are eligible for tax deduction benefits under section 80G of the Income Tax Act. We publish audited financial reports and impact metrics quarterly.
            </p>
          </div>
          <div className="shrink-0">
            <a href="/src/assets/illustrations/annual_report_mock.pdf" target="_blank" rel="noopener noreferrer">
              <Button variant="primary">Download Annual Report</Button>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
