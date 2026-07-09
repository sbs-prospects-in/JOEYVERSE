import React from 'react';
import { motion } from 'framer-motion';
import { hoverScale } from '../../lib/motion';

export default function Card({ 
  children, 
  className = '', 
  animate = true,
  ...props 
}) {
  const cardClasses = `bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden transition-shadow duration-300 hover:shadow-md ${className}`;

  if (!animate) {
    return (
      <div className={cardClasses} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={hoverScale}
      className={cardClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
}
