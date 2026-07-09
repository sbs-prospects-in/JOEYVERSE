import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useModal } from '../../context/ModalContext';

export default function AdoptionModal() {
  const { isAdoptionOpen, closeAdoption, openContact } = useModal();
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  const pets = [
    {
      id: 1,
      name: 'Sheru',
      type: 'Dog',
      breed: 'Indie Rescue',
      age: '2 Years',
      location: 'Andheri West, Mumbai',
      img: '/images/hero-dog.png',
      story: 'Sheru was rescued from a busy highway with a fractured leg. After two months of treatment, he is now healthy, vaccinated, and looking for a loving family. He is extremely friendly with children and other pets.',
      tags: ['Energetic', 'Friendly', 'Vaccinated']
    },
    {
      id: 2,
      name: 'Bella',
      type: 'Cat',
      breed: 'Calico',
      age: '1 Year',
      location: 'Bandra West, Mumbai',
      img: '/images/feeding-scene.jpg', // placeholder or reuse
      story: 'Bella was found abandoned in a rain shelter. She is a quiet, gentle soul who loves curling up in warm corners and enjoys soft head rubs. She is litter-trained and fully vaccinated.',
      tags: ['Gentle', 'Quiet', 'Litter Trained']
    },
    {
      id: 3,
      name: 'Rocky',
      type: 'Dog',
      breed: 'Indie Rescue',
      age: '3 Years',
      location: 'Borivali East, Mumbai',
      img: '/images/dogs-street.png',
      story: 'Rocky was rescued from an anti-cruelty scenario. Despite his rough past, he has blossomed into a loyal and protective companion. He is looking for a patient pet parent who can give him the space to feel safe.',
      tags: ['Loyal', 'Protective', 'Neuter Completed']
    },
    {
      id: 4,
      name: 'Mimi',
      type: 'Cat',
      breed: 'Tabby Rescue',
      age: '8 Months',
      location: 'Dadar, Mumbai',
      img: '/images/vaccination-camp.png',
      story: 'Mimi was rescued from a gutter when she was just a few weeks old. She is full of curiosity, loves chasing laser pointers, and is extremely vocal when she wants cuddle time.',
      tags: ['Curious', 'Affectionate', 'Playful']
    }
  ];

  useEffect(() => {
    if (isAdoptionOpen) {
      document.body.style.overflow = 'hidden';
      
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.5,
        ease: 'power3.inOut'
      });
      
      gsap.to(containerRef.current, {
        y: '0%',
        duration: 0.8,
        ease: 'power4.out',
        delay: 0.1
      });

      gsap.fromTo(cardsRef.current, 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.4 }
      );
    } else {
      document.body.style.overflow = 'auto';
      
      gsap.to(containerRef.current, {
        y: '100%',
        duration: 0.6,
        ease: 'power3.inOut'
      });
      
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.4,
        ease: 'power3.inOut',
        delay: 0.3
      });
    }
  }, [isAdoptionOpen]);

  const handleInquiry = (pet) => {
    closeAdoption();
    // Open contact modal with preselected adoption type and passing pet details
    setTimeout(() => {
      openContact('adoption', pet);
    }, 400); // Wait for close transition
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none flex items-end md:items-center justify-center p-0 md:p-8"
    >
      <div 
        ref={containerRef}
        className="w-full max-w-[1440px] h-[90vh] md:h-auto md:max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-t-3xl md:rounded-2xl overflow-y-auto translate-y-full relative flex flex-col p-8 md:p-16"
      >
        {/* Close Button */}
        <button 
          onClick={closeAdoption}
          className="absolute top-6 right-6 md:top-8 md:right-8 z-50 text-white/50 hover:text-white transition-colors p-2"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Header */}
        <div className="mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-[#bd905b] mb-4 block">Meet Our Rescues</span>
          <h2 className="text-4xl md:text-5xl font-light">Available for <span className="font-bold">Adoption</span></h2>
          <p className="body-standard opacity-60 max-w-2xl mt-4">
            fostering or adopting opens up shelter space and saves a life. Find your new companion below.
          </p>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pets.map((pet, i) => (
            <div 
              key={pet.id} 
              ref={el => cardsRef.current[i] = el}
              className="bg-[#111111] border border-white/5 p-6 md:p-8 rounded-sm grid grid-cols-1 sm:grid-cols-12 gap-8 hover:border-white/10 transition-colors duration-300"
            >
              {/* Pet Image */}
              <div className="sm:col-span-5 h-[200px] sm:h-full overflow-hidden rounded-sm bg-[#0a0a0a]">
                <img 
                  src={pet.img} 
                  alt={pet.name} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => { e.target.src = '/images/hero-dog.png'; }}
                />
              </div>

              {/* Pet Details */}
              <div className="sm:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-light">{pet.name}</h3>
                    <span className="text-xs uppercase bg-white/5 border border-white/10 text-white/85 px-3 py-1 rounded-full">
                      {pet.type}
                    </span>
                  </div>

                  <p className="text-xs text-[#bd905b] tracking-wider uppercase mb-4">{pet.breed} • {pet.age}</p>
                  <p className="text-sm opacity-65 leading-relaxed line-clamp-3 mb-4">{pet.story}</p>
                  
                  {/* Location badge */}
                  <div className="flex items-center gap-1.5 text-xs text-white/50 mb-4">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {pet.location}
                  </div>

                  {/* Personality Tags */}
                  <div className="flex flex-wrap gap-2">
                    {pet.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-white/5 text-white/60 px-2 py-0.5 rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleInquiry(pet)}
                  className="w-full py-4 border border-[#bd905b]/20 hover:border-[#bd905b] text-[#bd905b] font-medium tracking-widest uppercase hover:bg-[#bd905b]/10 transition-colors duration-300 rounded-sm text-xs"
                >
                  Foster or Adopt {pet.name}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
