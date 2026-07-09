import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useModal } from '../../context/ModalContext';

export default function DonateModal() {
  const { isDonateOpen, closeDonate } = useModal();
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const contentRefs = useRef([]);

  useEffect(() => {
    if (isDonateOpen) {
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

      gsap.fromTo(contentRefs.current, 
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
  }, [isDonateOpen]);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none flex items-end md:items-center justify-center p-0 md:p-8"
    >
      <div 
        ref={containerRef}
        className="w-full max-w-[1600px] h-[90vh] md:h-auto md:max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-t-3xl md:rounded-2xl overflow-y-auto translate-y-full relative flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button 
          onClick={closeDonate}
          className="absolute top-6 right-6 md:top-8 md:right-8 z-50 text-white/50 hover:text-white transition-colors p-2"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Option A: Monetary */}
        <div className="flex-1 p-8 md:p-16 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center">
          <div ref={el => contentRefs.current[0] = el}>
            <span className="text-xs uppercase tracking-[0.2em] text-[#bd905b] mb-4 block">Fund a Meal. Save a Life.</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6">Monetary<br/><span className="font-bold">Donation</span></h2>
            <p className="body-standard max-w-md mb-12">
              Every rupee goes directly towards medical treatments, vaccinations, and daily meals for street animals in need.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              {['₹500', '₹1000', 'Custom'].map((amt) => (
                <button key={amt} className="py-4 border border-white/20 hover:border-[#bd905b] hover:bg-[#bd905b]/10 rounded-sm text-sm tracking-widest transition-all">
                  {amt}
                </button>
              ))}
            </div>
            
            <button className="w-full py-5 bg-[#F7F7F7] text-black font-medium tracking-widest uppercase hover:bg-[#bd905b] hover:text-white transition-colors duration-300 rounded-sm">
              Donate Now
            </button>
          </div>
        </div>

        {/* Option B: Essentials */}
        <div className="flex-1 p-8 md:p-16 bg-[#111111] flex flex-col justify-center">
          <div ref={el => contentRefs.current[1] = el}>
            <span className="text-xs uppercase tracking-[0.2em] text-[#a3a3a3] mb-4 block">Physical Contributions</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6">Donate<br/><span className="font-bold">Essentials</span></h2>
            <p className="body-standard max-w-md mb-12">
              We constantly need supplies to keep our shelters and daily runs operational. Your physical donations are deeply appreciated.
            </p>

            <div className="mb-12">
              <h4 className="text-sm tracking-widest uppercase text-white/50 mb-6 border-b border-white/10 pb-4">Current Critical Needs</h4>
              <ul className="grid grid-cols-2 gap-y-6 gap-x-4">
                {['Dog Food (Dry & Wet)', 'Rice & Lentils', 'Old Blankets / Towels', 'Tick & Flea Meds', 'First Aid Supplies', 'Cleaning Supplies'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm md:text-base font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bd905b]"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <a href="mailto:beingkind.india@gmail.com" className="w-full inline-flex justify-center py-5 border border-white/20 hover:border-white text-white font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-300 rounded-sm">
              Contact to Drop-off
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
