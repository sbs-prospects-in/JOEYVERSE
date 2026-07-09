import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { IMPACT_STATS } from '../../data/impactStats';
import { staggerContainer, fadeUp } from '../../lib/motion';

function Counter({ value, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) return;

    const startTime = performance.now();

    const animateCount = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(progress * end);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function HomeImpactStats() {
  return (
    <section className="py-24 bg-primary-dark text-white relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-primary uppercase block mb-3">Our Footprint</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Impact in Numbers
          </h2>
          <p className="mt-4 text-gray-400 text-base md:text-lg font-light">
            Every feed, rescue, and advocacy effort brings us closer to a safer environment for street animals. Here is what we have accomplished so far.
          </p>
        </div>

        {/* Grid Stats */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {IMPACT_STATS.map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={fadeUp}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center flex flex-col justify-between items-center h-full hover:border-primary/45 transition-colors duration-300"
            >
              <div>
                <div className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-2 flex items-center justify-center">
                  <Counter value={stat.value} />
                  <span>{stat.suffix}</span>
                </div>
                <h3 className="font-semibold text-base md:text-lg tracking-wide uppercase text-gray-200 mt-2 mb-3">
                  {stat.label}
                </h3>
              </div>
              <p className="text-sm text-gray-400 font-light mt-auto">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
