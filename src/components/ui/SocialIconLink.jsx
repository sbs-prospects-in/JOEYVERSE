import React from 'react';
import { motion } from 'framer-motion';
import { hoverScale, tapScale } from '../../lib/motion';

export default function SocialIconLink({ 
  icon: IconComponent, 
  href, 
  label 
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={hoverScale}
      whileTap={tapScale}
      className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-colors duration-200 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <IconComponent size={18} />
    </motion.a>
  );
}
