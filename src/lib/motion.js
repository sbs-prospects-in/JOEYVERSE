// Shared Framer Motion transitions and easing configurations (Restored for legacy components)

export const EASING = [0.25, 0.1, 0.25, 1]; // standard ease-in-out
export const EASE_OUT = [0.0, 0.0, 0.2, 1]; // decelerate
export const EASE_IN_OUT_EXPO = [0.87, 0, 0.13, 1]; // strong cinematic ease

// ─── Basic fade variants ─────────────────────────────────────────
export const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: EASING }
  }
};

export const fadeDown = {
  hidden: { y: -30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: EASE_OUT }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: EASING }
  }
};

export const fadeLeft = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.75, ease: EASE_OUT }
  }
};

export const fadeRight = {
  hidden: { x: 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.75, ease: EASE_OUT }
  }
};

// ─── Scale ───────────────────────────────────────────────────────
export const scaleUp = {
  hidden: { scale: 0.88, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.85, ease: EASE_IN_OUT_EXPO }
  }
};

export const scaleIn = {
  hidden: { scale: 0.92, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT }
  }
};

// ─── Stagger ─────────────────────────────────────────────────────
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

export const staggerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

// ─── Hero cinematic entrance ─────────────────────────────────────
export const heroLineVariant = {
  hidden: { y: 60, opacity: 0, skewY: 2 },
  visible: (i = 0) => ({
    y: 0,
    opacity: 1,
    skewY: 0,
    transition: {
      delay: 0.15 + i * 0.14,
      duration: 0.9,
      ease: EASE_IN_OUT_EXPO
    }
  })
};

// ─── Interaction variants ────────────────────────────────────────
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2, ease: 'easeInOut' }
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1, ease: 'easeInOut' }
};

export const hoverLift = {
  y: -4,
  transition: { duration: 0.22, ease: 'easeOut' }
};

// ─── Image reveal ────────────────────────────────────────────────
export const imageReveal = {
  hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 0.5 },
  visible: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 1.1, ease: EASE_IN_OUT_EXPO }
  }
};

// ─── Stat counter container ──────────────────────────────────────
export const statContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.2 }
  }
};

export const statItem = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.65, ease: EASE_OUT }
  }
};

// ─── Chapter end block ───────────────────────────────────────────
export const chapterEndReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASING }
  }
};
