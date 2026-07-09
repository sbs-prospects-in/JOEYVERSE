import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIMARY_NAV } from '../../data/nav';
import Button from '../ui/Button';

export default function MobileMenu({ isOpen, onClose }) {
  const containerVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    exit: { 
      opacity: 0, 
      x: '100%',
      transition: { duration: 0.2 }
    }
  };

  const listVariants = {
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl z-50 p-6 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" onClick={onClose} className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900">
                  <span className="p-1.5 rounded-lg bg-primary text-white flex items-center justify-center">
                    <Heart size={16} fill="currentColor" />
                  </span>
                  <span>Being Kind</span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Nav Links */}
              <motion.nav variants={listVariants} className="flex flex-col gap-5">
                {PRIMARY_NAV.map((item) => (
                  <motion.div key={item.path} variants={itemVariants}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) => `
                        text-lg font-medium tracking-wide block py-2 transition-colors duration-200 cursor-pointer
                        ${isActive ? 'text-primary font-bold border-l-2 border-primary pl-3' : 'text-gray-600 hover:text-primary'}
                      `}
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </motion.nav>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <Link to="/get-involved" onClick={onClose} className="block w-full">
                <Button className="w-full justify-center">
                  Donate Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
