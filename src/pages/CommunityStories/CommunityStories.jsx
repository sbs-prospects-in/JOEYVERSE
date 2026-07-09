import React, { useState } from 'react';
import SectionHeading from '../../components/ui/SectionHeading';
import StoryCard from './StoryCard';
import { STORIES } from '../../data/stories';

export default function CommunityStories() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Coexistence', 'Advocacy & Rescue', 'Daily Feeding'];

  const filteredStories = STORIES.filter((story) => {
    const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          story.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24 min-h-screen bg-white">
      
      {/* 1. Header Banner */}
      <section className="py-16 bg-neutral-bg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Voices from the Ground" 
            subtitle="Community Stories"
            align="left"
          />
          <p className="max-w-3xl text-gray-500 text-lg md:text-xl font-light leading-relaxed">
            Read heartwarming stories of rescues, community helpers, legal victories, and why street animals are part of our city's soul.
          </p>
        </div>
      </section>

      {/* 2. Filter & Search Controls */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-gray-200 bg-white text-gray-800 text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
      </section>

      {/* 3. Grid of Stories */}
      <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-bg rounded-3xl border border-gray-100">
            <p className="text-gray-400 text-lg">No stories found matching your filter options.</p>
          </div>
        )}
      </section>

    </div>
  );
}
