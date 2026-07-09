import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function StoryCard({ story }) {
  return (
    <Link to={`/community-stories/${story.slug}`} className="block h-full">
      <Card className="flex flex-col h-full cursor-pointer group">
        {/* Image / Aspect Ratio lock */}
        <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden">
          <img 
            src="/src/assets/images/hero_bg.png" 
            alt={story.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm">
            {story.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow flex flex-col justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block mb-2">{story.date}</span>
            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-primary transition-colors">
              {story.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
              {story.excerpt}
            </p>
          </div>
          
          <div className="text-xs text-primary font-bold tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
            READ STORY <ArrowRight size={14} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
