import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Clock } from 'lucide-react';
import { STORIES } from '../../data/stories';
import StoryCard from './StoryCard';
import Button from '../../components/ui/Button';

export default function CommunityStoryDetail() {
  const { slug } = useParams();
  
  const story = STORIES.find((s) => s.slug === slug);

  if (!story) {
    return (
      <div className="pt-32 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Story Not Found</h2>
        <p className="text-gray-500 mb-8">The story you are looking for does not exist or has been relocated.</p>
        <Link to="/community-stories">
          <Button variant="primary">Back to All Stories</Button>
        </Link>
      </div>
    );
  }

  // Get related stories (excluding the current one)
  const relatedStories = STORIES.filter((s) => s.slug !== slug).slice(0, 2);

  return (
    <article className="pt-24 min-h-screen bg-white">
      
      {/* 1. Header & Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link 
          to="/community-stories" 
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-primary hover:underline mb-8"
        >
          <ArrowLeft size={16} /> BACK TO STORIES
        </Link>
        
        <span className="text-xs md:text-sm font-bold text-primary tracking-wider uppercase block mb-3">
          {story.category}
        </span>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
          {story.title}
        </h1>

        {/* Metadata block */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} />
            <span>{story.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={16} />
            <span>{story.readTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={16} />
            <span>{story.category}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Image Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        <div className="aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden bg-gray-100 relative">
          <img 
            src="/src/assets/images/hero_bg.png" 
            alt={story.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 3. Article Content Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed text-base md:text-lg font-light space-y-6">
          {story.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* 4. Related Stories Section */}
      {relatedStories.length > 0 && (
        <section className="bg-neutral-bg border-t border-gray-100 mt-24 py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Related Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {relatedStories.map((rStory) => (
                <StoryCard key={rStory.id} story={rStory} />
              ))}
            </div>
          </div>
        </section>
      )}

    </article>
  );
}
