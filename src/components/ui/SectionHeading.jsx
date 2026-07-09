import React from 'react';

export default function SectionHeading({ 
  title, 
  subtitle, 
  align = 'left',
  className = ''
}) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={`mb-12 md:mb-16 ${alignmentClasses[align]} ${className}`}>
      {subtitle && (
        <span className="text-xs md:text-sm font-semibold tracking-wider text-primary uppercase block mb-3 md:mb-4">
          {subtitle}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
        {title}
      </h2>
    </div>
  );
}
