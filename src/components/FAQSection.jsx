import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How does an online vet consultation work?",
    answer: "You simply choose a certified vet from our panel, book a time slot, and connect via a secure video call or chat. The vet will assess your pet's symptoms, provide a diagnosis if possible, and prescribe treatment or recommend an in-person visit if necessary."
  },
  {
    question: "Can vets prescribe medication online?",
    answer: "Yes, our certified veterinarians can issue digital prescriptions for many common conditions, which you can use at your local pharmacy. Note that certain controlled substances or complex conditions may require an in-person physical exam."
  },
  {
    question: "Is this suitable for pet emergencies?",
    answer: "We provide Emergency Triage to quickly assess the severity of your pet's condition. While we can advise on immediate next steps and first aid, true life-threatening emergencies should always be taken to the nearest physical animal hospital immediately."
  },
  {
    question: "How do I create a profile for my pet?",
    answer: "Click the 'Create Profile' button on our site or app. You can log your pet's breed, age, medical history, dietary preferences, and vaccination records. This helps our vets give you the most accurate and personalized advice."
  },
  {
    question: "What types of pets do you treat?",
    answer: "Our panel includes specialists for dogs, cats, rabbits, birds, and other exotic pets. You can filter our vets by specialty to find the perfect match for your companion."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="flex flex-col gap-8 sm:gap-10 py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <p className="text-[0.75rem] font-bold text-green-600 uppercase tracking-[0.1em] mb-1.5">
            ● Common Questions
          </p>
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold text-slate-900 m-0 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
            >
              <h3 className="font-bold text-slate-800 text-base md:text-lg m-0 pr-8">
                {faq.question}
              </h3>
              <div 
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}
              >
                <ChevronDown size={18} className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0 text-slate-600 text-sm md:text-base leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
