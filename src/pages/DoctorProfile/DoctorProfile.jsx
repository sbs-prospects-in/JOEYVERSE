import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Award, Sparkles, HeartPulse, ShieldCheck, Clock, DollarSign, ChevronLeft, Calendar, Mail, CheckCircle2 } from 'lucide-react';

export default function DoctorProfile() {
  const { id } = useParams();

  // Unified static data lookup matching Doctors list
  const profiles = {
    'anjali-mehta': { 
      name: 'Dr. Anjali Mehta', 
      credentials: 'BVSc & AH, MVSc', 
      specialty: 'Canine & Feline Medicine', 
      experience: 10,
      fee: 35,
      rating: 4.9,
      bio: 'Dr. Anjali Mehta has over 10 years of clinical practice in domestic companion diagnostics. She specializes in chronic allergy panels, veterinary oncology guidance, and custom vaccination timelines for puppies and senior cats.',
      img: '/images/dr-anjali.png'
    },
    'vivek-patel': { 
      name: 'Dr. Vivek Patel', 
      credentials: 'BVSc, MVSc (Exotics)', 
      specialty: 'Avian & Exotic Animals', 
      experience: 8,
      fee: 40,
      rating: 4.8,
      bio: 'Dr. Vivek Patel is one of the region\'s few board-certified avian experts. He specializes in exotic reptile husbandry, diagnostic blood testing for exotic birds, and corrective feather surgeries.',
      img: '/images/dr-marcus.png'
    },
    'sarah-jenkins': { 
      name: 'Dr. Sarah Jenkins', 
      credentials: 'DVM, Dipl. ACVD', 
      specialty: 'Feline Dermatology', 
      experience: 12,
      fee: 45,
      rating: 4.9,
      bio: 'Dr. Sarah Jenkins focuses exclusively on cat skin allergy syndromes. Her research-backed methods help cure chronic ear infections, feline dermatitis scales, and hair loss syndromes.',
      img: 'https://images.unsplash.com/photo-1594824813573-246434e33963?q=80&w=400'
    },
    'david-chen': { 
      name: 'Dr. David Chen', 
      credentials: 'DVM, Dipl. ACVS', 
      specialty: 'Equine & Canine Surgery', 
      experience: 15,
      fee: 55,
      rating: 5.0,
      bio: 'Dr. David Chen is a veteran veterinary surgeon with extensive work in orthopedic rehabilitation. He specializes in soft tissue repair, arthritic joint management, and post-op support.',
      img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400'
    },
    'elena-rossi': { 
      name: 'Dr. Elena Rossi', 
      credentials: 'DVM, Ph.D. (Cardiology)', 
      specialty: 'Veterinary Cardiology', 
      experience: 9,
      fee: 45,
      rating: 4.7,
      bio: 'Dr. Elena Rossi focuses on advanced veterinary cardiac care panels. Her work involves blood pressure management, ultrasound diagnostic reviews, and chronic heart failure treatments.',
      img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'
    },
    'samuel-lee': { 
      name: 'Dr. Samuel Lee', 
      credentials: 'BVSc, MVSc (Nutrition)', 
      specialty: 'Animal Nutritionist', 
      experience: 11,
      fee: 35,
      rating: 4.9,
      bio: 'Dr. Samuel Lee specializes in tailoring dietary recipes for animals with metabolic, digestive, or allergic complications. He helps coordinate custom weight plans for dogs and cats.',
      img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400'
    }
  };

  const doctor = profiles[id] || {
    name: 'Dr. Veterinary Specialist',
    credentials: 'DVM / BVSc',
    specialty: 'General Veterinary Medicine',
    experience: 5,
    fee: 30,
    rating: 4.8,
    bio: 'Licensed board-certified veterinary medical practitioner with years of practical compassionate clinical experience.',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-8">
      
      {/* Back link */}
      <div>
        <Link 
          to="/doctors" 
          className="inline-flex items-center gap-1.5 text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Veterinarians
        </Link>
      </div>

      {/* ==========================================
         PROFILE HEADER CARD
         ========================================== */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
        
        {/* Subtle background overlay blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-rose-100/20 blur-3xl pointer-events-none" />
        
        {/* Headshot Frame */}
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-slate-50 shadow-md shrink-0">
          <img 
            src={doctor.img} 
            alt={doctor.name} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'; }}
          />
        </div>

        {/* Doctor Identity details */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <span className="inline-flex bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider mb-1">
            {doctor.specialty}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
            {doctor.name}
          </h1>
          <span className="text-slate-400 font-medium text-sm">
            {doctor.credentials}
          </span>
          
          {/* Status badge inline */}
          <div className="flex items-center gap-2 mt-4">
            <span className="bg-rose-50 border border-rose-100 px-3.5 py-1 text-xs font-bold text-rose-600 rounded-full flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5" /> Licensed Practitioner
            </span>
            <span className="bg-emerald-50 border border-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-600 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online Now
            </span>
          </div>
        </div>

        {/* Floating Rating Badge (Desktop) */}
        <div className="absolute top-6 right-6 hidden md:flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/50 shadow-sm">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-slate-700">{doctor.rating}</span>
        </div>

      </div>

      {/* ==========================================
         TWO-COLUMN SECTION
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Bio & Qualifications */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Biography Card */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100">
            <h3 className="border-l-4 border-rose-300 pl-3 font-extrabold text-lg text-slate-800 mb-4 tracking-tight">
              Professional Biography
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              {doctor.bio}
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mt-4">
              With over {doctor.experience} years of dedicated pet care experience, {doctor.name} remains committed to providing accessible, board-certified medical guidance. Our virtual consult clinic allows you to discuss symptoms, review diet plans, and obtain active stubs in the comfort of your home.
            </p>
          </div>

          {/* Clinical Focuses */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100">
            <h3 className="border-l-4 border-rose-300 pl-3 font-extrabold text-lg text-slate-800 mb-6 tracking-tight">
              Clinical Core Focuses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Triage & Diagnostics', desc: 'Symptom analysis, video physical triage review.' },
                { title: 'Prescription Coordination', desc: 'Secure medical renew panels and active stubs.' },
                { title: 'Chronic Care Panels', desc: 'Diet tweaks, behavioral guidance, allergy charts.' },
                { title: 'Emergency Guidance', desc: 'Late night critical first-aid tracking steps.' },
              ].map((focus, i) => (
                <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-none mb-1">{focus.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{focus.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Schedule & CTAs */}
        <div className="flex flex-col gap-6">
          
          {/* Scheduling Card */}
          <div className="bg-[#A9DFBF]/10 text-slate-800 rounded-[32px] p-8 shadow-md border border-[#A9DFBF]/30 flex flex-col gap-6 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#A9DFBF]/20 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <span className="text-emerald-700 font-extrabold text-[0.65rem] uppercase tracking-wider">
                Video / Chat Consult
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-slate-900 text-5xl font-black tracking-tight">${doctor.fee}</span>
                <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">/ Slot</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mt-2">
                Covers standard 20-minute video slots or 48-hour secure chat panels.
              </p>
            </div>

            {/* Schedule Details */}
            <div className="relative z-10 flex flex-col gap-3.5 border-t border-b border-[#A9DFBF]/25 py-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> Mon - Fri</span>
                <span className="font-extrabold text-slate-700">09:00 AM - 05:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> Saturday</span>
                <span className="font-extrabold text-slate-700">10:00 AM - 02:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> Sunday</span>
                <span className="font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-xs">Emergency Only</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="relative z-10 flex flex-col gap-3">
              <Link 
                to="/consult" 
                className="w-full inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl shadow-md transition-colors text-center text-sm gap-2"
              >
                <Calendar className="w-4.5 h-4.5 text-[#A9DFBF]" /> Book Consultation
              </Link>
              <div className="flex items-center gap-2 justify-center text-slate-500 text-xs mt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Medical Panel Practitioner</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
