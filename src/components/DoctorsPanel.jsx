import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data (Semi-Transparent Gradients using User Green #A9DFBF) ───────── */
const doctors = [
  {
    name: 'Dr. Anjali Mehta',
    specialty: 'Canine & Feline Medicine',
    exp: '9 yrs',
    rating: '4.9',
    photo: '/images/dr-anjali.png',
    cardBg: 'linear-gradient(160deg, rgba(169,223,191,0.55) 0%, rgba(130,204,150,0.55) 100%)',
    border: 'rgba(169,223,191,0.65)',
    infoBg: 'rgba(169,223,191,0.28)',
    infoBorder: 'rgba(169,223,191,0.45)',
    textDark: '#14532d',
    textLight: '#15803d',
    initials: 'AM',
    glow: '169,223,191',
    glowDark: '130,204,150',
  },
  {
    name: 'Dr. Marcus Owens',
    specialty: 'Avian & Exotic Animals',
    exp: '12 yrs',
    rating: '4.8',
    photo: '/images/dr-marcus.png',
    cardBg: 'linear-gradient(160deg, rgba(224,242,254,0.65) 0%, rgba(186,230,253,0.65) 100%)',
    border: 'rgba(186,230,253,0.7)',
    infoBg: 'rgba(186,230,253,0.3)',
    infoBorder: 'rgba(186,230,253,0.45)',
    textDark: '#0369a1',
    textLight: '#0284c7',
    initials: 'MO',
    glow: '187,247,208',
    glowDark: '169,223,191',
  },
  {
    name: 'Dr. Priya Nair',
    specialty: 'Feline Dermatology',
    exp: '7 yrs',
    rating: '4.9',
    photo: null,
    cardBg: 'linear-gradient(160deg, rgba(252,231,243,0.65) 0%, rgba(251,207,232,0.65) 100%)',
    border: 'rgba(251,207,232,0.7)',
    infoBg: 'rgba(251,207,232,0.3)',
    infoBorder: 'rgba(251,207,232,0.45)',
    textDark: '#be185d',
    textLight: '#db2777',
    initials: 'PN',
    glow: '169,223,191',
    glowDark: '132,194,194',
  },
];

const N = doctors.length;

export default function DoctorsPanel() {
  /* refs */
  const stageRef    = useRef(null);
  const stackRef    = useRef(null);
  const spotRef     = useRef(null);
  const glowARef    = useRef(null);
  const sectionRef  = useRef(null);
  const headRef     = useRef(null);

  /* one ref per card slot */
  const cardRefs = useRef([]);

  /* track which doctor is currently front */
  const frontIdx = useRef(0);
  const animating = useRef(false);

  /* ─── swap builder (Klarna-style beats) ─────────────────── */
  const doSwap = useCallback(() => {
    if (animating.current) return;
    animating.current = true;

    const slotOf = (offset) =>
      ((frontIdx.current + offset) % N + N) % N;

    /* update ghost card bg colours without re-render */
    const syncGhostColors = () => {
      [1, 2].forEach((offset) => {
        const el = cardRefs.current[slotOf(offset)];
        if (el) gsap.set(el, { background: doctors[slotOf(offset)].cardBg });
      });
    };

    const nextIdx = slotOf(1);
    const prevIdx = frontIdx.current;
    const next    = doctors[nextIdx];
    const prev    = doctors[prevIdx];

    const frontEl = cardRefs.current[prevIdx];
    const nextEl  = cardRefs.current[nextIdx];

    /* position next card to the right, offscreen */
    gsap.set(nextEl, {
      x: '100%', y: '0%', opacity: 0, scale: 0.95, rotateZ: 8,
      zIndex: 4, background: next.cardBg,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        frontIdx.current = nextIdx;
        /* demote old front to back ghost */
        gsap.set(frontEl, {
          x: '0%', y: '0%', opacity: 1, scale: 0.85,
          rotateZ: 6, zIndex: 1,
          background: prev.cardBg,
        });
        syncGhostColors();
        animating.current = false;
      },
    });

    /* 1 – ANTICIPATION */
    tl.to(stackRef.current, { scale: 0.98, duration: 0.2, ease: 'power1.in' })

      /* 2 – next card ENTERS from right, front card FLIES to left */
      .to(stackRef.current, { scale: 1, duration: 0.45, ease: 'back.out(1.8)' })
      .to(nextEl, { x: '0%', opacity: 1, scale: 1.02, rotateZ: 0, duration: 0.62, ease: 'expo.out' }, '<+0.02')
      .to(frontEl, { x: '-110%', opacity: 0, scale: 0.95, rotateZ: -10, duration: 0.52, ease: 'power2.in' }, '<')

      /* 3 – SETTLE */
      .to(nextEl, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, '-=0.25')

      /* 4 – glow shift */
      .to(glowARef.current, {
        background: `radial-gradient(circle at 50% 40%, rgba(${next.glow},.55), transparent 65%)`,
        duration: 1.1, ease: 'sine.inOut',
      }, '-=0.9');
  }, []);

  /* ─── set initial card positions ──────────────────────── */
  const initStack = () => {
    const d = doctors;
    /* front card */
    gsap.set(cardRefs.current[0], { x: '0%', y: '0%', opacity: 1, scale: 1, rotateZ: 0, zIndex: 3, background: d[0].cardBg });
    /* ghost 1 */
    gsap.set(cardRefs.current[1], { x: '0%', y: '0%', opacity: 1, scale: 0.93, rotateZ: 3, zIndex: 2, background: d[1].cardBg });
    /* ghost 2 */
    gsap.set(cardRefs.current[2], { x: '0%', y: '0%', opacity: 1, scale: 0.85, rotateZ: 6, zIndex: 1, background: d[2].cardBg });
  };

  /* ─── useEffect ────────────────────────────────────────── */
  useEffect(() => {
    initStack();

    /* heading reveal */
    gsap.fromTo(headRef.current,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 88%' } });

    /* stage scroll entrance – blur + Y + scale like Klarna */
    gsap.fromTo(stageRef.current,
      { opacity: 0, y: 70, scale: 0.94, filter: 'blur(14px)' },
      {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
        duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: stageRef.current, start: 'top 82%' },
        onComplete: () => {
          /* glow appears after stage */
          gsap.to(glowARef.current, { opacity: 1, duration: 1.4, ease: 'sine.out' });
        },
      });

    /* auto cycle */
    const interval = setInterval(doSwap, 3200);

    /* hover tilt + spotlight */
    const stage = stageRef.current;
    const spot  = spotRef.current;

    const tiltX = gsap.quickTo(stackRef.current, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const tiltY = gsap.quickTo(stackRef.current, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const spX   = gsap.quickTo(spot, 'x', { duration: 0.55, ease: 'power3.out' });
    const spY   = gsap.quickTo(spot, 'y', { duration: 0.55, ease: 'power3.out' });

    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      tiltX(px * 14); tiltY(-py * 14);
      spX(e.clientX - r.left); spY(e.clientY - r.top);
    };
    const onEnter = () => {
      stage.classList.add('hovered');
      gsap.to(stackRef.current, { scale: 1.03, duration: 0.5, ease: 'power3.out' });
      gsap.to(spot, { opacity: 1, duration: 0.4 });
    };
    const onLeave = () => {
      stage.classList.remove('hovered');
      tiltX(0); tiltY(0);
      gsap.to(stackRef.current, { scale: 1, duration: 0.6, ease: 'power3.out' });
      gsap.to(spot, { opacity: 0, duration: 0.4 });
    };

    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseenter', onEnter);
    stage.addEventListener('mouseleave', onLeave);

    return () => {
      clearInterval(interval);
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseenter', onEnter);
      stage.removeEventListener('mouseleave', onLeave);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [doSwap]);

  /* ─── render ──────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes sheenSweep {
          0%,18%  { transform: translateX(-130%); }
          42%,100%{ transform: translateX( 130%); }
        }
      `}</style>

      <section ref={sectionRef} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* ── Heading ── */}
        <div ref={headRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: 0 }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.4rem' }}>
              ● Verified Specialists
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Meet Our Medical Panel
            </h2>
          </div>
          <Link to="/doctors" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.875rem', fontWeight: '700', color: '#15803d',
            textDecoration: 'none', whiteSpace: 'nowrap',
            border: '1.5px solid #a9dfbf', padding: '0.5rem 1.125rem',
            borderRadius: '9999px', background: '#f0fdf4',
            transition: 'all 0.2s',
          }} className="hover:bg-green-100 hover:border-green-400">
            View All Vets →
          </Link>
        </div>

        {/* ── World (stage + ambient glow) ── */}
        <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Left: cinematic stage */}
          <div style={{ position: 'relative', width: 'min(90%, 380px)', flexShrink: 0, margin: '0 auto' }}>

            {/* Ambient glow blob */}
            <div ref={glowARef} style={{
              position: 'absolute', inset: '-22% -30%',
              zIndex: 0, filter: 'blur(46px)', pointerEvents: 'none', opacity: 0,
            }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: `radial-gradient(circle at 50% 40%, rgba(${doctors[0].glow},.55), transparent 65%)`,
              }} />
            </div>

            {/* Stage */}
            <div
              ref={stageRef}
              style={{
                position: 'relative', zIndex: 1,
                width: '100%', aspectRatio: '5/7',
                background: 'linear-gradient(180deg, #0d0c0e, #08080a)',
                borderRadius: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                perspective: '1600px',
                overflow: 'hidden',
                boxShadow: '0 40px 80px -30px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.04)',
                opacity: 0,
              }}
            >
              {/* Vignette */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none',
                boxShadow: 'inset 0 0 80px 16px rgba(0,0,0,.5)' }} />

              {/* Grain */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none',
                opacity: 0.045, mixBlendMode: 'overlay',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }} />

              {/* Spotlight */}
              <div ref={spotRef} style={{
                position: 'absolute', zIndex: 4, width: '260px', height: '260px',
                marginLeft: '-130px', marginTop: '-130px',
                borderRadius: '50%', left: 0, top: 0,
                background: 'radial-gradient(circle, rgba(255,255,255,.10), transparent 70%)',
                mixBlendMode: 'overlay', opacity: 0, pointerEvents: 'none',
              }} />

              {/* Card stack */}
              <div ref={stackRef} style={{
                position: 'relative', zIndex: 2,
                width: '68%', aspectRatio: '3/4',
                transformStyle: 'preserve-3d', willChange: 'transform',
              }}>
                {doctors.map((doc, i) => (
                  <div
                    key={doc.name}
                    ref={el => cardRefs.current[i] = el}
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '16px', overflow: 'hidden',
                      boxShadow: '0 22px 44px -12px rgba(0,0,0,.55)',
                      transformOrigin: 'bottom center',
                      backfaceVisibility: 'hidden',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: `1.5px solid ${doc.border}`,
                    }}
                  >
                    {/* Sheen */}
                    <div style={{
                      position: 'absolute', inset: '-60%', zIndex: 3, pointerEvents: 'none',
                      background: 'linear-gradient(115deg, transparent 42%, rgba(255,255,255,.22) 50%, transparent 58%)',
                      animation: 'sheenSweep 6s ease-in-out infinite',
                    }} />

                    {/* Photo area */}
                    <div style={{
                      height: '62%', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {doc.photo ? (
                        <img src={doc.photo} alt={doc.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                      ) : (
                        <div style={{
                          width: '80px', height: '80px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.75rem', fontWeight: '800', color: doc.textDark,
                        }}>{doc.initials}</div>
                      )}
                    </div>

                    {/* Info area (Glassmorphic sub-panel) */}
                    <div style={{
                      height: '38%', padding: '0.75rem 1rem 1rem',
                      background: doc.infoBg,
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      borderTop: `1.5px solid ${doc.infoBorder}`,
                      display: 'flex', flexDirection: 'column', gap: '0.25rem',
                    }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: '700', color: doc.textDark, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {doc.exp} · ⭐ {doc.rating}
                      </p>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: '800', color: doc.textDark, margin: 0, lineHeight: 1.2 }}>
                        {doc.name}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: doc.textLight, margin: 0, fontWeight: '600' }}>
                        {doc.specialty}
                      </p>
                      <Link to="/doctors" style={{
                        marginTop: 'auto',
                        display: 'inline-block',
                        fontSize: '0.7rem', fontWeight: '700',
                        background: '#ffffff',
                        color: doc.textDark,
                        padding: '0.35rem 0.875rem',
                        borderRadius: '9999px',
                        textDecoration: 'none',
                        alignSelf: 'flex-start',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }}>
                        Book Consult →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: copy + stats */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            {/* Green ambient blur behind stats to manifest green glassmorphism */}
            <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(169,223,191,0.28), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />

            <p style={{ fontSize: '1.0625rem', lineHeight: '1.75', color: '#475569', margin: 0, relative: 'z-10' }}>
              Every veterinarian on our platform is board-certified, licensed, and individually verified before they see a single patient. We check credentials, clinical history, and council registration — so you never have to wonder.
            </p>

            {/* Stats grid (Multi-Pastel Glassmorphism theme) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative', zIndex: 10 }}>
              {[
                { 
                  val: '120+', 
                  label: 'Verified Vets', 
                  bg: 'rgba(224, 242, 254, 0.45)', 
                  border: 'rgba(186, 230, 253, 0.75)', 
                  textDark: '#0369a1', 
                  textLight: '#0284c7' 
                },
                { 
                  val: '50k+', 
                  label: 'Pets Treated', 
                  bg: 'rgba(252, 231, 243, 0.45)', 
                  border: 'rgba(251, 207, 232, 0.75)', 
                  textDark: '#be185d', 
                  textLight: '#db2777' 
                },
                { 
                  val: '4.9★', 
                  label: 'Avg. Rating', 
                  bg: 'rgba(254, 249, 195, 0.45)', 
                  border: 'rgba(253, 224, 71, 0.6)', 
                  textDark: '#854d0e', 
                  textLight: '#a16207' 
                },
                { 
                  val: '<10m', 
                  label: 'Avg. Wait Time', 
                  bg: 'rgba(169, 223, 191, 0.22)', 
                  border: 'rgba(169, 223, 191, 0.55)', 
                  textDark: '#14532d', 
                  textLight: '#15803d' 
                },
              ].map(({ val, label, bg, border, textDark, textLight }) => (
                <div key={label} style={{
                  background: bg,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  border: `1px solid ${border}`,
                  boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.02)',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: textDark, letterSpacing: '-0.02em' }}>{val}</div>
                  <div style={{ fontSize: '0.8125rem', color: textLight, fontWeight: '600', marginTop: '0.2rem' }}>{label}</div>
                </div>
              ))}
            </div>

            <Link to="/doctors" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#0f172a', color: '#fff',
              fontWeight: '700', fontSize: '0.9rem',
              padding: '0.85rem 1.75rem', borderRadius: '9999px',
              textDecoration: 'none', alignSelf: 'flex-start',
              boxShadow: '0 4px 16px rgba(15,23,42,0.2)',
              relative: 'z-10',
            }}>
              Browse All Vets →
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
