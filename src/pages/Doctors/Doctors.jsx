import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Sparkles, HeartPulse, Clock, DollarSign, PawPrint, Heart } from 'lucide-react';

function BoneSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="14" />
      <circle cx="20" cy="40" r="14" />
      <circle cx="80" cy="20" r="14" />
      <circle cx="80" cy="40" r="14" />
      <rect x="20" y="20" width="60" height="20" />
    </svg>
  );
}

function FishSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,30 Q40,5 75,30 Q40,55 10,30" />
      <polygon points="75,30 95,15 90,30 95,45" />
      <circle cx="25" cy="25" r="3" fill="#ffffff" />
    </svg>
  );
}

export default function Doctors() {
  const doctors = [
    { 
      id: 'anjali-mehta', 
      name: 'Dr. Anjali Mehta', 
      specialty: 'Canine & Feline Medicine', 
      specialtyKey: 'canine',
      species: ['dog', 'cat'],
      rating: 4.9,
      experience: 10,
      fee: 35,
      bio: 'Specialist in companion animal diagnostics, preventative clinical therapy, and vaccine schedules.',
      img: '/images/dr-anjali.png'
    },
    { 
      id: 'vivek-patel', 
      name: 'Dr. Vivek Patel', 
      specialty: 'Avian & Exotic Animals', 
      specialtyKey: 'exotics',
      species: ['birds', 'reptiles'],
      rating: 4.8,
      experience: 8,
      fee: 40,
      bio: 'Experienced in avian medicine, exotic reptile diagnostics, and small mammal treatments.',
      img: '/images/dr-marcus.png'
    },
    { 
      id: 'sarah-jenkins', 
      name: 'Dr. Sarah Jenkins', 
      specialty: 'Feline Dermatology', 
      specialtyKey: 'dermatology',
      species: ['cat'],
      rating: 4.9,
      experience: 12,
      fee: 45,
      bio: 'Expert feline skin clinic head, treating dermatitis, allergy reactions, and chronic ear conditions.',
      img: 'https://images.unsplash.com/photo-1594824813573-246434e33963?q=80&w=400'
    },
    { 
      id: 'david-chen', 
      name: 'Dr. David Chen', 
      specialty: 'Equine & Canine Surgery', 
      specialtyKey: 'surgery',
      species: ['dog'],
      rating: 5.0,
      experience: 15,
      fee: 55,
      bio: 'Specialist in orthopedics, soft tissue surgical consulting, and post-op physical rehabilitation.',
      img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400'
    },
    { 
      id: 'elena-rossi', 
      name: 'Dr. Elena Rossi', 
      specialty: 'Veterinary Cardiology', 
      specialtyKey: 'cardiology',
      species: ['dog', 'cat'],
      rating: 4.7,
      experience: 9,
      fee: 45,
      bio: 'Focused on cardiac health panels, blood pressure management, and chronic heart failure triage.',
      img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'
    },
    { 
      id: 'samuel-lee', 
      name: 'Dr. Samuel Lee', 
      specialty: 'Animal Nutritionist', 
      specialtyKey: 'nutrition',
      species: ['dog', 'cat'],
      rating: 4.9,
      experience: 11,
      fee: 35,
      bio: 'Custom diet formulator for metabolic disorders, allergy management plans, and weight loss.',
      img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400'
    }
  ];

  const [specialty, setSpecialty] = useState('all');
  const [species, setSpecies] = useState('all');
  const [sort, setSort] = useState('rating');

  const filteredDoctors = doctors
    .filter(doc => specialty === 'all' || doc.specialtyKey === specialty)
    .filter(doc => species === 'all' || doc.species.includes(species))
    .sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'experience') return b.experience - a.experience;
      if (sort === 'fee') return a.fee - b.fee;
      return 0;
    });

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-16 relative overflow-hidden">
      
      {/* Mesh Background Blobs for Glassmorphism visual impact */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-teal-200/10 blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-amber-200/10 blur-3xl pointer-events-none z-0" />

      {/* Floating Doodles */}
      <div className="absolute top-44 left-4 text-purple-400/20 z-0 pointer-events-none animate-float hidden lg:block select-none">
        <PawPrint className="w-12 h-12 rotate-12" />
      </div>
      <div className="absolute top-[480px] -right-8 text-amber-400/20 z-0 pointer-events-none animate-float-delayed rotate-45 hidden lg:block select-none">
        <BoneSVG className="w-20 h-12" />
      </div>
      <div className="absolute bottom-[320px] -left-10 text-teal-400/20 z-0 pointer-events-none animate-float-slow -rotate-12 hidden lg:block select-none">
        <FishSVG className="w-16 h-10" />
      </div>
      <div className="absolute bottom-20 right-6 text-rose-400/20 z-0 pointer-events-none animate-float hidden lg:block select-none">
        <Heart className="w-10 h-10 fill-rose-400/10" />
      </div>

      {/* ==========================================
         HERO SECTION (FOODGO MOCKUP REDESIGN)
         ========================================== */}
      <header className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-center min-h-[480px] z-10 relative mt-6">
        
        {/* Left Column: Branding, Title, Description, Buttons */}
        <div className="flex-1 flex flex-col gap-6 items-center lg:items-start text-center lg:text-left">
          
          {/* Tracking tag */}
          <span className="text-[0.68rem] font-black text-slate-500 uppercase tracking-widest pl-1">
            For Loving Pet Parents
          </span>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-slate-800 tracking-tight leading-tight">
            Your favorite <br />
            <span className="text-rose-500 italic font-serif">specialists & checkups</span> <br />
            in one place.
          </h1>

          {/* Description */}
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-md pl-1 font-medium">
            Streamline your veterinary advice, nutritional tracking, and prescription stubs with our vetted clinical panels.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-2">
            <a 
              href="#specialty" 
              className="bg-white hover:bg-slate-50 text-slate-850 px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider border border-slate-200 shadow-sm transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('specialty')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              What we do?
            </a>
            <Link 
              to="/consult" 
              className="bg-slate-900 hover:bg-rose-500 text-white hover:text-white px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Consult now →
            </Link>
          </div>

        </div>

        {/* Right Column: Vet Circle composite & floating details */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative shrink-0 min-h-[360px] lg:min-h-[440px] z-10">
          
          {/* Salmon/Pink backing blob circle */}
          <div className="absolute w-[280px] h-[280px] md:w-[320px] md:h-[320px] bg-rose-100/75 rounded-full z-0 pointer-events-none animate-pulse-slow" />

          {/* Doctor Portrait Image */}
          <div className="w-[260px] h-[260px] md:w-[300px] md:h-[300px] rounded-full overflow-hidden border-4 border-white shadow-xl hover:scale-[1.02] transition-transform duration-500 relative z-10 shrink-0">
            <img 
              src="/images/dr-anjali.png" 
              alt="Veterinarian Panel" 
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Floating Sticker 1: Green fish badge (Left) */}
          <div className="absolute top-1/3 left-16 md:left-24 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-teal-600 z-20 border border-slate-100 hover:scale-110 transition-transform pointer-events-none">
            <PawPrint className="w-4 h-4 fill-current" />
          </div>

          {/* Floating Sticker 2: Small green carrot/badge (Right) */}
          <div className="absolute bottom-1/3 right-16 md:right-24 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-emerald-600 z-20 border border-slate-100 hover:scale-110 transition-transform pointer-events-none">
            <Heart className="w-4 h-4 fill-current" />
          </div>

          {/* Floating Sticker 3: Salad plate -> Small Tabby Card (Top Right) */}
          <div className="absolute top-6 right-12 md:right-20 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg rotate-[8deg] z-20 hover:scale-105 transition-transform pointer-events-none animate-float">
            <img src="/images/orange-tabby.png" alt="Puppy check" className="w-full h-full object-cover" />
          </div>

          {/* Floating Sticker 4: Avocado -> Cartoon Bunny (Bottom Left) */}
          <div className="absolute bottom-6 left-12 md:left-20 w-14 h-14 rounded-full overflow-hidden border-4 border-white shadow-lg rotate-[-12deg] z-20 hover:scale-105 transition-transform pointer-events-none animate-float-delayed">
            <img src="/images/bunny.png" alt="Cat health" className="w-full h-full object-cover" />
          </div>

          {/* Floating Sticker 5: Green arrow loop swirl (Bottom Center) */}
          <svg className="absolute -bottom-10 left-20 w-24 h-20 text-[#A9DFBF] rotate-[10deg] pointer-events-none z-20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M10,80 C30,95 60,90 70,60 C80,30 50,20 40,40 C30,60 60,80 90,60" />
            <path d="M90,60 L80,54 M90,60 L84,70" />
          </svg>

          {/* Floating Sticker 6: Heart Healthy metric card (Bottom Right) */}
          <div className="absolute bottom-10 right-2 md:right-8 bg-white border border-slate-100 rounded-2xl shadow-lg px-4 py-2.5 flex flex-col items-start gap-0.5 z-20 hover:scale-105 transition-transform pointer-events-none select-none animate-float">
            <span className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wide">Active Panel</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-slate-800">15+ Vets Online</span>
            </div>
          </div>

        </div>

      </header>

      {/* ==========================================
         FILTER ROW (GLASSMORPHISM STYLE - TINTED GREEN #A9DFBF)
         ========================================== */}
      <div className="bg-[#A9DFBF]/15 backdrop-blur-md rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] border border-[#A9DFBF]/30 flex flex-col md:flex-row gap-6 max-w-5xl mx-auto w-full z-10 relative">
        {/* Specialty Filter */}
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="specialty" className="text-xs font-black text-slate-600 uppercase tracking-wider">Specialty</label>
          <select 
            id="specialty" 
            className="bg-white/50 border border-[#A9DFBF]/25 focus:border-[#A9DFBF] focus:bg-white text-slate-700 text-sm rounded-xl px-4 py-3.5 outline-none transition-all w-full cursor-pointer shadow-sm"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="all">All Specialties</option>
            <option value="canine">Canine & Feline</option>
            <option value="exotics">Avian & Exotics</option>
            <option value="dermatology">Dermatology</option>
            <option value="surgery">Surgery</option>
            <option value="cardiology">Cardiology</option>
            <option value="nutrition">Nutrition</option>
          </select>
        </div>

        {/* Species Focus Filter */}
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="species" className="text-xs font-black text-slate-600 uppercase tracking-wider">Species Focus</label>
          <select 
            id="species" 
            className="bg-white/50 border border-[#A9DFBF]/25 focus:border-[#A9DFBF] focus:bg-white text-slate-700 text-sm rounded-xl px-4 py-3.5 outline-none transition-all w-full cursor-pointer shadow-sm"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          >
            <option value="all">All Species</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="birds">Birds</option>
            <option value="reptiles">Reptiles</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="sort" className="text-xs font-black text-slate-600 uppercase tracking-wider">Sort By</label>
          <select 
            id="sort" 
            className="bg-white/50 border border-[#A9DFBF]/25 focus:border-[#A9DFBF] focus:bg-white text-slate-700 text-sm rounded-xl px-4 py-3.5 outline-none transition-all w-full cursor-pointer shadow-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="rating">Highest Rated</option>
            <option value="experience">Years of Experience</option>
            <option value="fee">Lowest Consultation Fee</option>
          </select>
        </div>
      </div>

      {/* ==========================================
         DOCTORS GRID LISTING (GLASSMORPHISM STYLE - TINTED GREEN #A9DFBF)
         ========================================== */}
      <section className="flex flex-col gap-8 z-10 relative">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[32px] border border-dashed border-slate-200/60">
            <div className="text-slate-400 text-lg font-bold">No Veterinarians found</div>
            <p className="text-slate-400 text-sm mt-1">Try resetting your filter options above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-[#A9DFBF]/10 backdrop-blur-md rounded-[32px] p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-[#A9DFBF]/30 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(169,223,191,0.2)] transition-all duration-300 group min-h-[460px] relative overflow-hidden"
              >
                <div>
                  {/* Doctor Headshot Frame */}
                  <div className="w-full h-52 rounded-2xl overflow-hidden mb-5 relative shrink-0 shadow-sm border border-[#A9DFBF]/20">
                    <img 
                      src={doc.img} 
                      alt={doc.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'; }}
                    />
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[0.65rem] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" /> Available
                    </div>
                  </div>

                  {/* Specialty */}
                  <span className="inline-flex bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider mb-3">
                    {doc.specialty}
                  </span>

                  {/* Name and Rating */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="text-slate-800 font-extrabold text-xl leading-tight group-hover:text-rose-600 transition-colors">
                      {doc.name}
                    </h2>
                    <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/50">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-slate-700">{doc.rating}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {doc.bio}
                  </p>
                </div>

                {/* Footer Info & Action */}
                <div className="mt-auto">
                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 border-t border-b border-[#A9DFBF]/25 py-3 mb-5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 justify-center border-r border-slate-200/40">
                      <Award className="w-4 h-4 text-emerald-500" />
                      <span>{doc.experience} Years</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-center">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span>${doc.fee} Fee</span>
                    </div>
                  </div>

                  {/* Button */}
                  <Link 
                    to={`/doctors/${doc.id}`} 
                    className="w-full inline-flex items-center justify-center bg-white/80 backdrop-blur-sm text-slate-800 font-extrabold text-xs py-3.5 px-4 rounded-xl border border-white/80 group-hover:bg-[#A9DFBF] group-hover:text-slate-900 transition-all shadow-sm"
                  >
                    View Full Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
