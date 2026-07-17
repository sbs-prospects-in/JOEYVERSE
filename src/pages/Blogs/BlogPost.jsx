import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';

export default function BlogPost() {
  const { id } = useParams();

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto min-h-screen">
      <Link to="/blogs" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 mt-8">
        <ArrowLeft size={16} /> Back to all articles
      </Link>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full border bg-green-50 text-green-700 border-green-200">
            Pet Health
          </span>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Clock size={14} /> 5 min read
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Understanding Your Pet's Needs: Article #{id}
        </h1>
        
        <div className="flex items-center justify-between border-y border-slate-100 py-6 my-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Dr+Joey&background=f2687c&color=fff" alt="Author" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 m-0">Dr. Joey Smith</p>
              <p className="text-xs text-slate-500 m-0">Veterinary Specialist</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-900 transition-colors p-2 bg-slate-50 rounded-full hover:bg-slate-100">
            <Share2 size={18} />
          </button>
        </div>

        <div className="w-full h-[400px] rounded-3xl overflow-hidden mb-12">
          <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200" alt="Blog cover" className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-lg prose-slate max-w-none">
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            This is a placeholder for the full article content. As a dynamic platform, actual blog posts will be fetched from your database or CMS. For now, you are viewing the template for article ID: {id}.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Key Takeaways</h3>
          <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-8">
            <li>Always observe your pet's daily habits.</li>
            <li>Schedule regular check-ups with your vet.</li>
            <li>Maintain a healthy and balanced diet.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
