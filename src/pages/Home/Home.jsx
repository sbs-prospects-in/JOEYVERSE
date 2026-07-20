import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Video, Pill, Apple, HeartPulse, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import DoctorsPanel from '../../components/DoctorsPanel';
import FAQSection from '../../components/FAQSection';
import BlogSection from '../../components/BlogSection';

export default function Home() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-20 pt-20 sm:pt-28 pb-10">

      {/* ==========================================
         HERO SECTION (Centered layout based on Vetic mockup structure)
         ========================================== */}
      {/* ==========================================
         HERO SECTION — Centered, Vetic-style
         ========================================== */}
      <header className="flex flex-col items-center text-center gap-6 sm:gap-8 pt-8 sm:pt-12 pb-6 sm:pb-8 relative overflow-hidden rounded-[2.5rem] -mx-4 sm:mx-0 px-4 sm:px-6">

        {/* ── Animal Collage Background Grid ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '3px',
          zIndex: 0,
          pointerEvents: 'none',
        }}>
          {[
            '/images/grey-cat-purple.png',
            '/images/golden-retriever.png',
            '/images/vet-puppy-blue.png',
            '/images/orange-tabby.png',
            '/images/siamese-cat.png',
            '/images/collie-yellow.png',
            '/images/bunny.png',
            '/images/parrot.png',
            '/images/hamster.png',
            '/images/golden-retriever.png',
            '/images/grey-cat-purple.png',
            '/images/orange-tabby.png',
          ].map((src, i) => (
            <div key={i} style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
              <img
                src={src}
                alt=""
                aria-hidden="true"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'saturate(1.1)' }}
              />
            </div>
          ))}
        </div>

        {/* ── Frosted glass overlay so text stays legible ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(248, 250, 252, 0.82)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 1,
          pointerEvents: 'none',
        }} />

        {/* ── All content below sits at zIndex 2+ above the background ── */}

        {/* ── Decorative floating paw badges ── */}
        <div className="hidden sm:flex absolute top-14 left-[6%] w-10 h-10 rounded-full bg-yellow-200 items-center justify-center pointer-events-none z-10 animate-float">
          <PawPrint className="w-4 h-4" />
        </div>
        <div className="hidden sm:flex absolute top-6 left-[22%] w-10 h-10 rounded-full bg-sky-200 items-center justify-center pointer-events-none z-10 animate-float-delayed">
          <PawPrint className="w-4 h-4" />
        </div>
        <div className="hidden sm:flex absolute top-6 right-[22%] w-10 h-10 rounded-full bg-orange-200 items-center justify-center pointer-events-none z-10 animate-float-slow">
          <PawPrint className="w-4 h-4" />
        </div>
        <div className="hidden sm:flex absolute top-14 right-[6%] w-10 h-10 rounded-full bg-green-200 items-center justify-center pointer-events-none z-10 animate-float">
          <PawPrint className="w-4 h-4" />
        </div>

        {/* ── Tagline ── */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: '700', color: '#dc2626', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#dc2626', flexShrink: 0 }} />
          Joeyverse
        </div>

        {/* ── H1 Headline with pink underline SVG on "pet wellness" ── */}
        <h1 className="relative z-10 text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight max-w-[820px] mx-auto">
          Your reliable partner for{' '}
          <span className="relative inline-block whitespace-nowrap">
            pet wellness
            <svg
              viewBox="0 0 120 10"
              preserveAspectRatio="none"
              className="absolute left-0 -bottom-1.5 w-full h-2 sm:h-2.5 text-pink-400"
              aria-hidden="true"
            >
              <path d="M0,6 C40,10 80,2 120,6" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* ── Subheading ── */}
        <p className="relative z-10 text-base sm:text-lg leading-relaxed text-slate-500 max-w-[560px] mx-auto px-2">
          Connect instantly with certified veterinarians for real-time video consults and secure chat.
          Get professional care for your pet from the comfort of your home.
        </p>

        {/* ── CTA Row ── */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Primary pill button */}
          <Link
            to="/doctors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.625rem',
              backgroundColor: '#0f172a',
              color: '#fff',
              borderRadius: '9999px',
              paddingLeft: '1.5rem',
              paddingRight: '0.375rem',
              paddingTop: '0.375rem',
              paddingBottom: '0.375rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              letterSpacing: '0.01em',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(15,23,42,0.18)',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            Book a Consult
            <span style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PawPrint style={{ width: '15px', height: '15px', fill: '#0f172a', stroke: 'none' }} />
            </span>
          </Link>

          {/* Secondary text link */}
          <Link
            to="/services"
            style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
          >
            See how it works
            <span aria-hidden="true" style={{ fontSize: '1rem' }}>›</span>
          </Link>
        </div>

        {/* ── Three image cards ── */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-4">
          {/* Card 1 — cat, purple bg */}
          <div className="rounded-[2rem] overflow-hidden bg-purple-50 aspect-[4/5] flex items-center justify-center">
            <img
              src="/images/grey-cat-purple.png"
              alt="Grey cat on purple background"
              className="w-full h-full object-cover block"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400'; }}
            />
          </div>
          {/* Card 2 — vet + puppy, blue bg */}
          <div className="rounded-[2rem] overflow-hidden bg-sky-50 aspect-[4/5] flex items-center justify-center">
            <img
              src="/images/vet-puppy-blue.png"
              alt="Veterinarian holding a puppy on blue background"
              className="w-full h-full object-cover block"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400'; }}
            />
          </div>
          {/* Card 3 — dog, yellow bg */}
          <div className="rounded-[2rem] overflow-hidden bg-yellow-50 aspect-[4/5] hidden sm:flex items-center justify-center">
            <img
              src="/images/collie-yellow.png"
              alt="Border collie dog on yellow background"
              className="w-full h-full object-cover block"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400'; }}
            />
          </div>
        </div>

        {/* ── Service Category Pills ── */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.625rem',
          width: '100%',
          paddingTop: '1.5rem',
          paddingBottom: '1.5rem',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
        }}>
          {[
            { label: 'Video consultations', color: '#f43f5e', path: '/services#video-consultations' },
            { label: '24/7 Vet chat', color: '#a855f7', path: '/services#vet-chat' },
            { label: 'Digital prescriptions', color: '#22c55e', path: '/services#prescriptions' },
            { label: 'Symptom checking', color: '#f97316', path: '/services#symptom-checking' },
            { label: 'Health tracking', color: '#3b82f6', path: '/services#health-tracking' },
            { label: 'Diet & nutrition', color: '#eab308', path: '/services#diet-nutrition' },
          ].map(({ label, color, path }) => (
            <Link
              to={path}
              key={label}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm whitespace-nowrap hover:bg-slate-50 hover:shadow-md hover:border-slate-300 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
              {label}
            </Link>
          ))}
        </div>

      </header>

      {/* ==========================================
         INTRO BANNER — Playful pet-shelter style
         ========================================== */}
      <section className="relative bg-[#A8E6A3] rounded-[2.5rem] -mx-4 sm:mx-0 px-6 sm:px-8 pt-16 sm:pt-20 pb-16 min-h-[400px] sm:min-h-[520px] flex items-center justify-center overflow-hidden">

        {/* ── Decorative SVG wavy lines ── */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} viewBox="0 0 1000 520" preserveAspectRatio="none">
          <path d="M-50,200 C150,100 300,350 500,200 C700,50 850,300 1050,180" stroke="#f9a8d4" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M-50,320 C200,200 400,420 600,280 C800,140 900,380 1050,300" stroke="#f9a8d4" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        </svg>

        {/* ── Blob + Animal: Top Left (lavender blob + dog) ── */}
        <div className="hidden md:block absolute top-8 left-[3%] z-10">
          <div className="w-[140px] h-[130px] bg-purple-200 rounded-[60%_40%_50%_50%/50%_60%_40%_50%] flex items-center justify-center overflow-hidden">
            <img src="/images/cartoon-dog.png" alt="" aria-hidden="true" className="w-[110px] h-[110px] object-contain mix-blend-multiply" />
          </div>
        </div>

        {/* ── Blob + Animal: Top Center (mint blob + cat) ── */}
        <div className="hidden lg:block absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="w-[130px] h-[120px] bg-emerald-200 rounded-[50%_60%_40%_50%/60%_40%_60%_40%] flex items-center justify-center overflow-hidden">
            <img src="/images/cartoon-cat.png" alt="" aria-hidden="true" className="w-[105px] h-[105px] object-contain mix-blend-multiply" />
          </div>
        </div>

        {/* ── Blob + Animal: Top Right (rose blob + paw emoji) ── */}
        <div className="hidden md:block absolute top-8 right-[3%] z-10">
          <div className="w-[135px] h-[125px] bg-rose-200 rounded-[40%_60%_50%_50%/50%_40%_60%_50%] flex items-center justify-center text-6xl leading-none">
            🐱
          </div>
        </div>

        {/* ── Blob + Animal: Bottom Left (sky blob + running dog emoji) ── */}
        <div className="hidden lg:block absolute bottom-8 left-[2%] z-10">
          <div className="w-[130px] h-[110px] bg-blue-200 rounded-[50%_40%_60%_40%/40%_60%_40%_60%] flex items-center justify-center text-5xl leading-none">
            🐶
          </div>
        </div>

        {/* ── Blob + Animal: Bottom Right (yellow blob + rabbit emoji) ── */}
        <div className="hidden sm:block absolute bottom-8 right-[2%] z-10">
          <div className="w-[140px] h-[130px] bg-yellow-200 rounded-[60%_40%_40%_60%/40%_60%_60%_40%] flex items-center justify-center text-6xl leading-none">
            🐰
          </div>
        </div>

        {/* ── Center Content ── */}
        <div className="relative z-20 text-center max-w-xl mx-auto flex flex-col items-center gap-5">
          {/* Pill badge */}
          <span className="inline-block bg-white border-[1.5px] border-fuchsia-400 text-fuchsia-700 text-[11px] font-bold tracking-widest uppercase py-1.5 px-4 rounded-full">
            Why Joeyverse
          </span>

          {/* Big playful heading */}
          <h2 className="text-4xl sm:text-5xl font-black text-indigo-950 leading-[1.1] tracking-tight m-0">
            Speak with a Vet in <span className="text-fuchsia-400">Minutes</span>,<br className="hidden sm:block" />
            Not Days
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-[15px] leading-relaxed text-gray-600 m-0 max-w-md">
            A worried mind needs a steady voice. Open our app, choose from credentialed board-certified specialists, and start text-chatting or video-calling instantly.
          </p>
          <p className="text-sm sm:text-[15px] leading-relaxed text-gray-600 m-0 max-w-md">
            We verify licensing credentials, check active council boards, and confirm veterinary clinical expertise before any professional joins our panels.
          </p>

          {/* CTA */}
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 bg-indigo-950 text-white font-bold text-[15px] py-3 px-8 rounded-full no-underline mt-2 shadow-[0_4px_16px_rgba(30,27,75,0.25)] hover:scale-105 transition-transform"
          >
            Meet Our Verified Vets →
          </Link>
        </div>

      </section>

      {/* ==========================================
         DOCTORS PREVIEW SECTION
         ========================================== */}
      <DoctorsPanel />

      {/* ==========================================
         SERVICES PREVIEW SECTION
         ========================================== */}
      <section className="flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:align-bottom gap-4">
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1.5">
              ● What We Do
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight m-0">
              Professional Consultations
            </h2>
          </div>
          <Link to="/services" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.875rem', fontWeight: '700', color: '#16a34a',
            textDecoration: 'none', whiteSpace: 'nowrap',
            border: '1.5px solid #86efac', padding: '0.5rem 1.125rem',
            borderRadius: '9999px', background: '#f0fdf4',
            transition: 'all 0.2s ease-in-out',
          }}>
            View Services <ArrowRight size={16} />
          </Link>
        </div>

        {/* Services Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {[
            {
              title: 'Video Consultation',
              desc: 'A thorough diagnostic look through your smartphone camera with a certified vet practitioner.',
              icon: <Video size={24} style={{ color: '#7c3aed' }} />,
              bg: '#f5f3ff',
              badgeBg: '#ddd6fe',
              hoverGlow: 'rgba(124, 58, 237, 0.08)',
            },
            {
              title: 'Prescription Refills',
              desc: 'Coordinate medication lists and request active prescription stubs directly to your local pharmacy.',
              icon: <Pill size={24} style={{ color: '#e11d48' }} />,
              bg: '#fff1f2',
              badgeBg: '#fecdd3',
              hoverGlow: 'rgba(225, 29, 72, 0.08)',
            },
            {
              title: 'Nutritional Advice',
              desc: 'Obtain dietary guidelines customized for your pet breed\'s metabolism, age, and wellness needs.',
              icon: <Apple size={24} style={{ color: '#b45309' }} />,
              bg: '#fffbeb',
              badgeBg: '#fef3c7',
              hoverGlow: 'rgba(180, 83, 9, 0.08)',
            },
            {
              title: 'Emergency Triage',
              desc: 'Instant primary risk checking and advice for sudden injuries, toxic ingestions, or urgent issues.',
              icon: <HeartPulse size={24} style={{ color: '#047857' }} />,
              bg: '#f0fdf4',
              badgeBg: '#d1fae5',
              hoverGlow: 'rgba(4, 120, 87, 0.08)',
            },
          ].map((srv, idx) => (
            <Link
              to="/services"
              key={idx}
              className="service-card-interactive"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '1.5rem',
                padding: '2.25rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none'
              }}
            >
              {/* Colored Badge Top Border accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: srv.badgeBg,
              }} />

              {/* Icon Container */}
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '1rem',
                background: srv.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {srv.icon}
              </div>

              {/* Text content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                  {srv.title}
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#64748b', margin: 0 }}>
                  {srv.desc}
                </p>
              </div>

              {/* Arrow transition indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: '700',
                color: '#0f172a',
                marginTop: '0.5rem',
              }}>
                Learn more <ArrowRight size={14} className="arrow-icon-shift" style={{ transition: 'transform 0.25s ease' }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==========================================
         SUCCESS STORIES PREVIEW SECTION
         ========================================== */}
      <section className="flex flex-col gap-8 sm:gap-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.4rem' }}>
              ● Testimonials
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Relief Narratives
            </h2>
          </div>
          <Link to="/success-stories" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.875rem', fontWeight: '700', color: '#16a34a',
            textDecoration: 'none', whiteSpace: 'nowrap',
            border: '1.5px solid #86efac', padding: '0.5rem 1.125rem',
            borderRadius: '9999px', background: '#f0fdf4',
            transition: 'all 0.2s ease-in-out',
            alignSelf: 'flex-start',
          }}>
            Read Stories <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {[
            {
              quote: '"My labrador ate something strange at midnight. A doctor answered in seconds and guided me. True relief!"',
              author: 'Mark Olsen',
              role: 'Dog Owner',
              rating: 5,
              initials: 'MO',
              bg: '#c4b5fd',
              color: '#3b0764',
            },
            {
              quote: '"I was worried about a small lump. The vet on the video call was calm, examined photos, and scheduled follow-ups."',
              author: 'Sarah Jenkins',
              role: 'Cat Owner',
              rating: 5,
              initials: 'SJ',
              bg: '#fda4af',
              color: '#4c0519',
            },
            {
              quote: '"Saved us a costly physical emergency room visit for what turned out to be a simple, treatable allergy."',
              author: 'David Chen',
              role: 'Rabbit Owner',
              rating: 5,
              initials: 'DC',
              bg: '#fde68a',
              color: '#78350f',
            },
          ].map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '1.5rem',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Giant quote mark decoration */}
              <span style={{
                position: 'absolute',
                top: '1rem',
                right: '1.5rem',
                fontSize: '4rem',
                fontWeight: '900',
                color: story.bg + '30',
                fontFamily: 'serif',
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none',
              }}>
                “
              </span>

              {/* Stars row */}
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              {/* Quote text */}
              <p style={{
                fontSize: '0.9375rem',
                lineHeight: '1.6',
                color: '#475569',
                fontStyle: 'italic',
                margin: 0,
                flexGrow: 1,
                position: 'relative',
                zIndex: 1,
              }}>
                {story.quote}
              </p>

              {/* Author Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: story.bg,
                  color: story.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                }}>
                  {story.initials}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {story.author}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
                    {story.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==========================================
         FAQ & BLOG SECTIONS
         ========================================== */}
      <FAQSection />
      <BlogSection />

      {/* ==========================================
         CLOSING CTA SECTION — Notebook & Graph Paper Style
         ========================================== */}
      <section className="relative bg-[#f2687c] rounded-[2.5rem] -mx-4 sm:mx-0 px-4 sm:px-8 py-24 sm:py-28 mb-16 flex flex-col items-center gap-12 sm:gap-14" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.18) 2px, transparent 2px)',
        backgroundSize: '28px 28px',
        backgroundPosition: 'center',
      }}>
        {/* Torn Paper Top Border */}
        <div style={{
          position: 'absolute',
          top: -1,
          left: 0,
          right: 0,
          height: '24px',
          zIndex: 4,
          overflow: 'hidden',
          lineHeight: 0,
        }}>
          <svg viewBox="0 0 1200 24" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,0 L0,15 Q30,8 60,18 T120,12 T180,19 T240,10 T300,20 T360,11 T420,17 T480,9 T540,19 T600,12 T660,18 T720,10 T780,20 T840,11 T900,17 T960,9 T1020,19 T1080,12 T1140,18 T1200,10 L1200,0 Z" fill="#f8fafc" />
          </svg>
        </div>

        {/* Torn Paper Bottom Border */}
        <div style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: '24px',
          zIndex: 4,
          overflow: 'hidden',
          lineHeight: 0,
        }}>
          <svg viewBox="0 0 1200 24" preserveAspectRatio="none" style={{ width: '100%', height: '100%', transform: 'rotate(180deg)' }}>
            <path d="M0,0 L0,15 Q30,8 60,18 T120,12 T180,19 T240,10 T300,20 T360,11 T420,17 T480,9 T540,19 T600,12 T660,18 T720,10 T780,20 T840,11 T900,17 T960,9 T1020,19 T1080,12 T1140,18 T1200,10 L1200,0 Z" fill="#f8fafc" />
          </svg>
        </div>

        {/* Overlapping Cartoon Pencil (Top Right) */}
        <div className="hidden lg:block absolute top-14 right-[8%] w-[210px] h-[40px] z-10 pointer-events-none -rotate-12">
          <svg viewBox="0 0 210 40" fill="none" style={{ width: '100%', height: '100%' }}>
            {/* Eraser */}
            <path d="M190,10 L202,12 C206,13 208,18 206,22 C204,26 200,28 196,27 L190,25 Z" fill="#fda4af" stroke="#3730a3" strokeWidth="2.5" />
            {/* Metal band */}
            <rect x="180" y="8" width="10" height="18" fill="#cbd5e1" stroke="#3730a3" strokeWidth="2.5" />
            {/* Pencil Body */}
            <path d="M40,5 L180,8 L180,26 L40,23 Z" fill="#84cc16" stroke="#3730a3" strokeWidth="2.5" />
            <line x1="40" y1="14" x2="180" y2="17" stroke="#3730a3" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Wooden Tip */}
            <path d="M40,5 L15,14 L40,23 Z" fill="#fef08a" stroke="#3730a3" strokeWidth="2.5" />
            {/* Pencil Lead */}
            <path d="M22,12 C18,13 15,14 15,14 L22,18 Z" fill="#3730a3" />
          </svg>
        </div>

        {/* Overlapping Cartoon Ruler (Bottom Left) */}
        <div className="hidden lg:block absolute bottom-10 left-[5%] w-[280px] h-[60px] z-10 pointer-events-none rotate-6">
          <svg viewBox="0 0 280 60" fill="none" style={{ width: '100%', height: '100%' }}>
            {/* Ruler Body */}
            <rect x="5" y="5" width="270" height="48" rx="8" fill="#93c5fd" stroke="#1e3a8a" strokeWidth="3" />
            {/* Measurement lines */}
            {[...Array(27)].map((_, i) => (
              <line
                key={i}
                x1={15 + i * 9.5}
                y1="10"
                x2={15 + i * 9.5}
                y2={i % 5 === 0 ? "24" : "17"}
                stroke="#1e3a8a"
                strokeWidth="2"
              />
            ))}
            {/* Numbers */}
            <text x="12" y="38" fill="#1e3a8a" fontSize="10" fontWeight="800" fontFamily="sans-serif">0</text>
            <text x="59" y="38" fill="#1e3a8a" fontSize="10" fontWeight="800" fontFamily="sans-serif">1</text>
            <text x="107" y="38" fill="#1e3a8a" fontSize="10" fontWeight="800" fontFamily="sans-serif">2</text>
            <text x="154" y="38" fill="#1e3a8a" fontSize="10" fontWeight="800" fontFamily="sans-serif">3</text>
            <text x="202" y="38" fill="#1e3a8a" fontSize="10" fontWeight="800" fontFamily="sans-serif">4</text>
            <text x="249" y="38" fill="#1e3a8a" fontSize="10" fontWeight="800" fontFamily="sans-serif">5</text>
          </svg>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl z-10 flex flex-col items-center gap-4 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.15] tracking-tight drop-shadow-sm">
            Ready to give your companion the care they deserve?
          </h2>
          <p className="text-lg sm:text-2xl text-white/90 leading-relaxed max-w-xl font-['Caveat','Comic_Sans_MS',cursive]">
            Connect with certified veterinary panel practitioners instantly!
          </p>
        </div>

        {/* Playful 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-5xl z-10">
          {[
            {
              title: 'CREATE PROFILE',
              color: '#f43f5e',
              img: '/images/cartoon-cat.png',
              bullets: [
                'Breed & Age Details',
                'Medical History logs',
                'Dietary Preferences',
                'Vaccination Trackers',
              ],
            },
            {
              title: 'CHOOSE A VET',
              color: '#8b5cf6',
              img: '/images/dr-anjali.png',
              bullets: [
                '120+ Verified Vets',
                'Specialized Experts',
                'Video or Text Chat',
                'Rating & Reviews stats',
              ],
            },
            {
              title: 'START CONSULT',
              color: '#10b981',
              img: '/images/cartoon-dog.png',
              bullets: [
                'Book Instantly online',
                'Get Prescriptions fast',
                'Emergency Triage advice',
                'Follow-up Care plans',
              ],
            },
          ].map((card, idx) => (
            <div
              key={idx}
              style={{
                background: '#fffefb',
                border: '3px solid #d9384b',
                borderRadius: '1.75rem',
                padding: '2.25rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                position: 'relative',
              }}
            >
              {/* Flower / Organic Blob Photo Cutout */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '60% 40% 60% 40% / 40% 60% 40% 60%',
                background: card.color + '15',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2.5px solid ${card.color}`,
              }}>
                <img
                  src={card.img}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    mixBlendMode: 'multiply',
                  }}
                  onError={(e) => {
                    // Fallback to default initials or paw print if image fails
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Styled Ribbon / Card Title */}
              <div style={{
                background: '#fda4af',
                border: '2px solid #d9384b',
                padding: '0.4rem 1.5rem',
                borderRadius: '6px',
                fontWeight: '800',
                fontSize: '0.875rem',
                color: '#4c0519',
                letterSpacing: '0.05em',
                textAlign: 'center',
                boxShadow: '2px 2px 0px #d9384b',
              }}>
                {card.title}
              </div>

              {/* Bullet Points */}
              <ul style={{
                listStyleType: 'none',
                padding: 0,
                margin: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                borderTop: '1.5px dashed #fed7aa',
                paddingTop: '1rem',
              }}>
                {card.bullets.map((bullet, bIdx) => (
                  <li
                    key={bIdx}
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ color: '#d9384b', fontSize: '1.1rem' }}>•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Central Action CTA button */}
        <div style={{ zIndex: 2, marginTop: '1rem' }}>
          <Link
            to="/doctors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#1e1b4b',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.9375rem',
              padding: '0.9rem 2.5rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              boxShadow: '0 10px 20px rgba(30, 27, 75, 0.25)',
              transition: 'transform 0.2s ease',
            }}
          >
            Connect with Vets Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
