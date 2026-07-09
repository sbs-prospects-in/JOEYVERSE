import React from 'react';
import { motion } from 'framer-motion';
import { hoverScale, tapScale } from '../../lib/motion';

export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button',
  disabled = false,
  className = '',
  ...props 
}) {
  const baseStyle = "inline-flex items-center justify-center font-medium tracking-wide rounded-full transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm md:text-base px-6 py-3";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-accent focus-visible:ring-primary shadow-sm",
    secondary: "bg-primary-dark text-white hover:bg-gray-800 focus-visible:ring-primary-dark",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus-visible:ring-orange-500",
    text: "text-primary hover:text-accent font-semibold px-2 py-1"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : hoverScale}
      whileTap={disabled ? {} : tapScale}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
