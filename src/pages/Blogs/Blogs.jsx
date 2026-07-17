import React from 'react';
import BlogSection from '../../components/BlogSection';

export default function Blogs() {
  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-8 mt-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Our <span className="text-[#16a34a]">Journal</span></h1>
        <p className="text-slate-600 max-w-2xl mx-auto">Explore our latest articles, guides, and tips for keeping your furry friends happy and healthy.</p>
      </div>
      <BlogSection />
    </div>
  );
}
