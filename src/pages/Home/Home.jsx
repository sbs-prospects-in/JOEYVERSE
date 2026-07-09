import React, { useEffect, useRef } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useModal } from '../../context/ModalContext';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const { openDonate, openContact, openAdoption } = useModal();

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -432, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 432, behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Hero Image Parallax & Scale
      gsap.to('.hero-image-inner', {
        yPercent: 30,
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Hero Text Staggered Fade Up
      gsap.fromTo('.hero-text-line', 
        { y: 100, opacity: 0, clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
        { 
          y: 0, 
          opacity: 1, 
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
          duration: 1.8, 
          stagger: 0.2, 
          ease: 'power4.out',
          delay: 0.5 
        }
      );

      // Section Fade In Reveals (Generic)
      const fadeSections = gsap.utils.toArray('.fade-section');
      fadeSections.forEach((section) => {
        gsap.fromTo(section, 
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
            }
          }
        );
      });

      // Parallax Images in Content
      const parallaxImages = gsap.utils.toArray('.img-parallax');
      parallaxImages.forEach((img) => {
        gsap.to(img, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        });
      });

      // Clip Path Reveals for Images
      const clipImages = gsap.utils.toArray('.clip-reveal-trigger');
      clipImages.forEach((imgWrapper) => {
        gsap.fromTo(imgWrapper.querySelector('img'),
          { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.2 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            duration: 1.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: imgWrapper,
              start: 'top 80%',
            }
          }
        );
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-[#0a0a0a] text-[#e5e5e5] overflow-hidden">
      
      {/* ====================================================
          1. HERO SECTION (100vh Cinematic)
          ==================================================== */}
      <section id="hero" className="hero-section relative w-full h-[100vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="hero-image-inner absolute w-full h-[120%] -top-[10%] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/images/hero-dog.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 w-full max-w-[1440px] px-8 md:px-16 flex flex-col justify-end h-full pb-24 md:pb-32 mx-auto">
          <div className="mb-8 overflow-hidden">
            <p className="hero-text-line text-[#bd905b] tracking-[0.2em] uppercase text-xs md:text-sm font-medium">
              Because Every Life Matters
            </p>
          </div>
          <h1 className="headline-hero flex flex-col">
            <div className="overflow-hidden">
              <span className="hero-text-line block">Kindness</span>
            </div>
            <div className="overflow-hidden flex items-center gap-6 md:gap-12">
              <span className="hero-text-line block italic font-light lowercase text-[#bd905b]">on the</span>
              <span className="hero-text-line block">Streets.</span>
            </div>
          </h1>
        </div>
      </section>

      {/* ====================================================
          2. THE REALITY / ADVOCACY (Problem)
          ==================================================== */}
      <section id="advocacy" className="w-full bg-[#0a0a0a] py-24 md:py-32 border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start fade-section">
          
          <div className="lg:col-span-4 flex flex-col gap-8">
            <span className="text-xs uppercase tracking-widest text-[#a3a3a3]">The Reality</span>
            <h2 className="text-4xl md:text-6xl font-light">
              Over <span className="text-[#bd905b] font-medium">35 Million</span> Strays.
            </h2>
            <p className="body-standard opacity-70 max-w-sm mt-4">
              Most street animals never know safety, care, or a gentle hand. They face starvation, extreme weather, and cruelty on a daily basis. Breaking this cycle requires consistent, boots-on-the-ground effort.
            </p>
          </div>
          
          <div className="lg:col-span-8 lg:pl-16">
            <div className="clip-reveal-trigger w-full h-[500px] md:h-[600px] overflow-hidden rounded-sm relative">
              <img 
                src="/images/dogs-street.png" 
                alt="Street dogs in India"
                className="w-full h-full object-cover img-parallax"
                style={{ transform: 'scale(1.15)' }} 
                onError={(e) => { e.target.src = '/images/hero-dog.png'; }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* ====================================================
          3. WHAT WE DO (Programs / Solution)
          ==================================================== */}
      <section id="campaign" className="w-full bg-[#111111] py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16">
          <div className="mb-24 fade-section max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-[#a3a3a3]">Our Programs</span>
            <h2 className="text-4xl md:text-6xl font-light mt-8">
              Measurable change through consistent action.
            </h2>
          </div>

          <div className="flex flex-col border-t border-white/10">
            {[
              { title: 'Daily Feeding', desc: 'Systematic feeding routes across Mumbai reaching 500+ dogs every single day, rain or shine.' },
              { title: 'Vaccination Drives', desc: 'Monthly ABC (Animal Birth Control) and rabies vaccination camps to protect communities.' },
              { title: 'Anti-Cruelty Advocacy', desc: 'Documenting, reporting, and actively fighting cases of animal cruelty alongside authorities.' },
              { title: 'Adoption & Fostering', desc: 'Rehabilitating abandoned dogs and connecting them with loving foster families across India.' }
            ].map((item, i) => (
              <div key={i} className="fade-section group grid grid-cols-1 md:grid-cols-12 gap-8 py-12 border-b border-white/10 hover:bg-[#1a1a1a] transition-colors duration-500 cursor-pointer px-4 -mx-4">
                <div className="md:col-span-2 flex items-center">
                  <span className="text-sm text-[#bd905b]">0{i + 1}</span>
                </div>
                <div className="md:col-span-4 flex items-center">
                  <h3 className="text-2xl md:text-3xl font-light group-hover:pl-4 transition-all duration-500">{item.title}</h3>
                </div>
                <div className="md:col-span-6 flex items-center">
                  <p className="body-standard opacity-60 group-hover:opacity-100 transition-opacity duration-500 max-w-lg">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          4. OUR IMPACT (Stats + Stories)
          ==================================================== */}
      <section id="stories" className="w-full bg-[#0a0a0a] py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 fade-section mb-24">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#a3a3a3]">Our Impact</span>
              <h2 className="text-4xl md:text-6xl font-light mt-4">
                Lives <span className="text-[#bd905b] font-medium">Changed.</span>
              </h2>
            </div>
            {/* Carousel Navigation Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={scrollLeft}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-[#bd905b] hover:text-[#bd905b] transition-colors"
                aria-label="Previous story"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <button 
                onClick={scrollRight}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:border-[#bd905b] hover:text-[#bd905b] transition-colors"
                aria-label="Next story"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 mb-32 border-b border-white/10 pb-32">
            {[
              { num: '500+', label: 'Dogs Fed Daily' },
              { num: '200+', label: 'Vaccinations Monthly' },
              { num: '50+', label: 'Successful Adoptions' }
            ].map((stat, i) => (
              <div key={i} className="fade-section flex flex-col items-center text-center">
                <span className="text-6xl md:text-8xl font-thin tracking-tighter text-[#e5e5e5] mb-6">
                  {stat.num}
                </span>
                <span className="text-sm uppercase tracking-[0.2em] text-[#a3a3a3]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Stories Horizontal Carousel */}
          <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-8 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { img: '/images/hero-dog.png', title: "Raju's Recovery", text: "Found with a severe leg injury, Raju is now fully healed and running again after 3 months of care." },
              { img: '/images/feeding-scene.jpg', title: "A Community Effort", text: "How one neighborhood in Andheri sponsored daily meals for 20 stray dogs." },
              { img: '/images/vaccination-camp.png', title: "Zero Rabies Initiative", text: "Our recent vaccination drive in Bandra protected over 150 dogs and the surrounding community." },
              { img: '/images/dogs-street.png', title: "The Hospital Run", text: "Sponsoring emergency treatments for 15+ injured dogs every week across Mumbai suburbs." },
              { img: '/images/hero-dog.png', title: "Buster's New Home", text: "From an abandoned pup at a railway station to a beloved family member in Pune." },
              { img: '/images/feeding-scene.jpg', title: "Targeted Sterilization", text: "Preventing stray population surges through targeted local sterilization camps." }
            ].map((story, i) => (
              <div key={i} className="w-[280px] sm:w-[350px] md:w-[400px] flex-shrink-0 snap-start group cursor-pointer">
                <div className="w-full h-[350px] overflow-hidden rounded-sm mb-6 bg-[#111111]">
                  <img 
                    src={story.img} 
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = '/images/hero-dog.png'; }}
                  />
                </div>
                <h3 className="text-2xl font-light mb-3 group-hover:text-[#bd905b] transition-colors">{story.title}</h3>
                <p className="body-standard opacity-60 group-hover:opacity-100 transition-opacity">{story.text}</p>
              </div>
            ))}
          </div>
          
        </div>
      </section>


      {/* ====================================================
          5. VISUAL SPACER / CAT LOADER
          ==================================================== */}
      <section className="w-full py-16 md:py-24 overflow-hidden bg-[#111111] flex items-center justify-center fade-section">
        <div className="w-[180px] h-[180px] md:w-[250px] md:h-[250px] bg-[#0a0a0a] rounded-full p-6 flex items-center justify-center border border-white/5 shadow-2xl relative group">
          {/* Animated background pulse ring */}
          <div className="absolute inset-2 rounded-full border border-[#bd905b]/20 animate-ping opacity-30 scale-90 group-hover:scale-100 transition-transform duration-700" />
          
          <img 
            src="/images/loader-cat.gif" 
            alt="Cat Loader" 
            className="w-[75%] h-[75%] object-contain"
          />
        </div>
      </section>

      {/* ====================================================
          6. GET INVOLVED (Cards)
          ==================================================== */}
      <section id="get-involved" className="w-full bg-[#0a0a0a] py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16">
          <div className="flex flex-col gap-8 fade-section mb-16 items-center text-center">
            <span className="text-xs uppercase tracking-widest text-[#a3a3a3]">Take Action</span>
            <h2 className="text-4xl md:text-6xl font-light">
              Join the <span className="text-[#bd905b] font-medium">Movement.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 fade-section">
            <div className="bg-[#111111] p-12 md:p-16 rounded-sm flex flex-col justify-center items-start group cursor-pointer hover:bg-[#1a1a1a] transition-colors duration-500 border border-white/5">
              <h3 className="text-3xl md:text-4xl font-light mb-6 group-hover:text-[#bd905b] transition-colors">Become a Volunteer</h3>
              <p className="body-standard max-w-md mb-12 opacity-60">Join our on-ground teams for weekend feeding drives, rescue operations, and awareness campaigns across Mumbai.</p>
              <button onClick={() => openContact('volunteer')} className="text-sm uppercase tracking-widest border-b border-white/30 pb-2 hover:border-[#bd905b] transition-colors">Apply Now</button>
            </div>
            
            <div className="bg-[#111111] p-12 md:p-16 rounded-sm flex flex-col justify-center items-start group cursor-pointer hover:bg-[#1a1a1a] transition-colors duration-500 border border-white/5">
              <h3 className="text-3xl md:text-4xl font-light mb-6 group-hover:text-[#bd905b] transition-colors">Foster or Adopt a Pet</h3>
              <p className="body-standard max-w-md mb-12 opacity-60">Open your home to a rescued dog or cat. Whether temporarily fostering or giving a forever home, you save a life.</p>
              <button onClick={openAdoption} className="text-sm uppercase tracking-widest border-b border-white/30 pb-2 hover:border-[#bd905b] transition-colors">View Pets</button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          7. FOOTER (Cinematic, Large typography)
          ==================================================== */}
      <footer id="contact" className="w-full pt-32 md:pt-48 pb-16 md:pb-32 px-8 md:px-16 bg-[#111111] flex flex-col items-center text-center fade-section">
        <h2 className="text-[10vw] leading-none font-black tracking-tighter uppercase mb-12 opacity-90 text-[#e5e5e5]">
          Stand With Us
        </h2>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-24">
          <button onClick={openDonate} className="text-lg md:text-2xl font-light border-b border-white/20 hover:border-[#bd905b] hover:text-[#bd905b] pb-2 transition-all duration-300">
            Donate Now
          </button>
          <a href="https://www.instagram.com/beingkind_india/" target="_blank" rel="noopener noreferrer" className="text-lg md:text-2xl font-light border-b border-white/20 hover:border-[#F7F7F7] hover:text-white pb-2 transition-all duration-300">
            Instagram
          </a>
          <button onClick={() => openContact()} className="text-lg md:text-2xl font-light border-b border-white/20 hover:border-[#F7F7F7] hover:text-white pb-2 transition-all duration-300">
            Email Us
          </button>
        </div>

        <div className="w-full max-w-[1440px] flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-widest text-[#a3a3a3] border-t border-white/10 pt-8">
          <span>© 2024 Being Kind India.</span>
          <span className="mt-4 md:mt-0">Made with ♥ for every stray.</span>
        </div>
      </footer>

    </div>
  );
}
