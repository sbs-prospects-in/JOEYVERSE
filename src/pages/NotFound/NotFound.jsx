import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="pt-32 min-h-screen bg-white flex flex-col justify-center items-center px-4 text-center">
      <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-primary mb-8 animate-pulse-slow">
        <ShieldAlert size={40} />
      </div>
      
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-4">
        Page Not Found
      </h1>
      
      <p className="max-w-md text-gray-500 text-base md:text-lg font-light leading-relaxed mb-8">
        We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
      </p>

      <Link to="/">
        <Button variant="primary" className="flex items-center gap-2">
          <Home size={18} /> Back to Home Page
        </Button>
      </Link>
    </div>
  );
}
