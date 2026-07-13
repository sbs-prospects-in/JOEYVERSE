import React from 'react';
import { Link } from 'react-router-dom';
import { Video, MessageSquare, Pill, Apple, Award, Star } from 'lucide-react';

export default function Services() {
  const services = [
    { 
      number: '01',
      title: 'Video Consults', 
      desc: 'Secure high-definition video calls with verified veterinarians. Perfect for initial triage checks, visual symptoms review, and behavioral check-ins.',
      icon: Video,
      img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200',
      badge: '24/7 Available'
    },
    { 
      number: '02',
      title: 'Instant Vet Chat', 
      desc: 'Send messages, photos, or video clips of symptoms. Vets reply quickly to provide immediate guidance and follow-up adjustments.',
      icon: MessageSquare,
      img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1200',
      badge: 'Instant Reply'
    },
    { 
      number: '03',
      title: 'Digital Refills', 
      desc: 'Manage renewals and digital prescriptions stubs securely. Coordinate with pharmacy centers to request and deliver active refills.',
      icon: Pill,
      img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200',
      badge: 'Secure Stub'
    },
    { 
      number: '04',
      title: 'Diet & Nutrition', 
      desc: 'Obtain custom recipes and caloric intakes mapped specifically for your dog or cat\'s breeds, age weight, and metabolic conditions.',
      icon: Apple,
      img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1200',
      badge: 'Custom Diet'
    },
    { 
      number: '05',
      title: 'Behavior Tips', 
      desc: 'Discuss separation anxiety, social training blockages, and stress triggers with animal experts via video guidance calls.',
      icon: Award,
      img: 'https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=1200',
      badge: 'Expert Advice'
    }
  ];

  const packages = [
    { title: 'Single Consultation', price: '$35', duration: 'per call slot', desc: 'Ideal for quick concerns, single visual symptom questions, or late-night advice checks.' },
    { title: 'Monthly Plan', price: '$59', duration: 'per month', desc: 'Unlimited text threads and 2 video calls. Perfect for multi-pet records and chronic conditions.' },
    { title: 'Annual Care Pack', price: '$499', duration: 'per year', desc: 'Full care coverage with unlimited video calls, dedicated doctor support panels, and refills tracking.' }
  ];

  return (
    <div className="w-full flex flex-col">
      
      {/* ==========================================
         SCROLL-REVEAL HERO SLIDES (Bob Ross / Parallax Style)
         ========================================== */}
      {services.map((srv, idx) => {
        const Icon = srv.icon;
        return (
          <section key={idx} className="relative w-full h-screen z-10">
            
            {/* Parallax Clipping Window */}
            <div 
              className="absolute inset-0 overflow-hidden w-full h-full"
              style={{
                clip: 'rect(0, auto, auto, 0)',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                WebkitClipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
              }}
            >
              
              {/* Fixed Background Image */}
              <div 
                className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none select-none z-0"
                style={{ backgroundImage: `url(${srv.img})` }}
              />

              {/* Dark Frosted Layer */}
              <div className="fixed inset-0 w-full h-full bg-slate-950/50 backdrop-blur-[1px] z-10" />

              {/* Fixed Center Content */}
              <div className="fixed inset-0 flex flex-col justify-center items-center text-center p-6 text-white z-20 pointer-events-auto">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
                  
                  {/* Tagline / Header on the first slide only */}
                  {idx === 0 && (
                    <div className="flex flex-col items-center gap-2 mb-4 animate-fade-in">
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-black text-rose-300 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        Our Offerings
                      </div>
                      <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight leading-tight">
                        Veterinary Care Channels
                      </h1>
                    </div>
                  )}

                  {/* Slide Service Number */}
                  <div className="text-[#f2687c] font-black text-2xl tracking-widest uppercase font-serif">
                    Service {srv.number}
                  </div>

                  {/* Huge Parallax Title */}
                  <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-none text-white drop-shadow-sm flex items-center justify-center gap-4">
                    <Icon className="w-10 h-10 md:w-16 md:h-16 text-rose-300 shrink-0" strokeWidth={2.5} />
                    {srv.title}
                  </h2>

                  {/* Star Badge */}
                  <div className="bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>{srv.badge}</span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-xl">
                    {srv.desc}
                  </p>

                  {/* Action Link */}
                  <Link 
                    to="/consult" 
                    className="bg-[#f2687c] hover:bg-rose-600 text-white font-extrabold text-xs md:text-sm py-4 px-8 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all mt-4 inline-flex items-center gap-2"
                  >
                    Book Consultation Slot
                  </Link>

                </div>
              </div>

            </div>
          </section>
        );
      })}

      {/* ==========================================
         PRICING SECTION (Rising up over the slides, Bob Ross Style)
         ========================================== */}
      <section className="relative bg-[#f8fafc] z-20 py-24 px-4 md:px-8 border-t border-slate-100 shadow-[0_-20px_40px_rgba(0,0,0,0.04)]">
        
        {/* Triangular Peak / Notch pointing upwards */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[40px] border-b-[#f8fafc] filter drop-shadow-[0_-5px_3px_rgba(0,0,0,0.015)]" />

        <div className="max-w-[1280px] mx-auto flex flex-col gap-12">
          
          {/* Header */}
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
              Flexible <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Pricing</span> Tiers
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Choose a flexible plan that aligns with your companion's care requirements.
            </p>
          </div>
          
          {/* Pricing Container */}
          <div className="bg-white rounded-[32px] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100/60 flex flex-col md:flex-row gap-3 max-w-5xl mx-auto w-full">
            
            {/* Card 1 */}
            <div className="flex-1 bg-[#fff8ea] rounded-[24px] p-8 flex flex-col items-center text-center transition-transform hover:scale-[1.01]">
              <h3 className="text-[#004b75] font-extrabold text-xl mb-2">{packages[0].title}</h3>
              <div className="text-[#004b75] text-5xl font-black tracking-tight mb-1">{packages[0].price}</div>
              <div className="text-[#004b75]/60 text-[0.7rem] font-bold uppercase tracking-wider mb-6">{packages[0].duration}</div>
              <p className="text-[#004b75]/80 text-sm leading-relaxed mb-8 max-w-xs flex-1">{packages[0].desc}</p>
              <Link to="/consult" className="w-full inline-flex items-center justify-center bg-white text-[#004b75] font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-sm border border-[#004b75]/10 hover:bg-[#004b75] hover:text-white transition-colors mt-auto">
                Select Plan
              </Link>
            </div>

            {/* Card 2 */}
            <div className="flex-1 bg-[#eef5fc] rounded-[24px] p-8 flex flex-col items-center text-center transition-transform hover:scale-[1.01] border-2 border-[#004b75]/10 relative shadow-sm">
              <h3 className="text-[#004b75] font-extrabold text-xl mb-2">{packages[1].title}</h3>
              <div className="text-[#004b75] text-5xl font-black tracking-tight mb-1">{packages[1].price}</div>
              <div className="text-[#004b75]/60 text-[0.7rem] font-bold uppercase tracking-wider mb-6">{packages[1].duration}</div>
              <p className="text-[#004b75]/80 text-sm leading-relaxed mb-8 max-w-xs flex-1">{packages[1].desc}</p>
              <Link to="/consult" className="w-full inline-flex items-center justify-center bg-[#004b75] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md hover:bg-[#003858] transition-colors mt-auto">
                Select Plan
              </Link>
            </div>

            {/* Card 3 */}
            <div className="flex-1 bg-[#f4f8fa] rounded-[24px] p-8 flex flex-col items-center text-center transition-transform hover:scale-[1.01]">
              <h3 className="text-[#004b75] font-extrabold text-xl mb-2">{packages[2].title}</h3>
              <div className="text-[#004b75] text-5xl font-black tracking-tight mb-1">{packages[2].price}</div>
              <div className="text-[#004b75]/60 text-[0.7rem] font-bold uppercase tracking-wider mb-6">{packages[2].duration}</div>
              <p className="text-[#004b75]/80 text-sm leading-relaxed mb-8 max-w-xs flex-1">{packages[2].desc}</p>
              <Link to="/consult" className="w-full inline-flex items-center justify-center bg-white text-[#004b75] font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-sm border border-[#004b75]/10 hover:bg-[#004b75] hover:text-white transition-colors mt-auto">
                Select Plan
              </Link>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
