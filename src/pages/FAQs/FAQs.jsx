import React from 'react';
import FAQSection from '../../components/FAQSection';

export default function FAQs() {
  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-8 mt-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Frequently Asked <span className="text-amber-500">Questions</span></h1>
        <p className="text-slate-600 max-w-2xl mx-auto">Find answers to the most common questions about our veterinary services, booking process, and platform features.</p>
      </div>
      <FAQSection />
    </div>
  );
}
