import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/* ── Page Transition ─────────────────────────────────────────────────── */
// Wrap page content at the Layout level for automatic route transitions.
export function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex-1 flex flex-col h-full min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Stagger Container + Item ────────────────────────────────────────── */
// Wrap a grid/list in StaggerContainer, each child in StaggerItem.
const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function StaggerContainer({ children, className = "" }) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Animated Number ─────────────────────────────────────────────────── */
// Tweens a number from 0 (or previous value) to the target.
export function AnimatedNumber({ value, className = "" }) {
  const numValue = typeof value === "string" ? parseFloat(value) || 0 : (value ?? 0);
  const isPercentage = typeof value === "string" && value.includes("%");
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => {
    const rounded = Math.round(v);
    return isPercentage ? `${rounded}%` : rounded.toLocaleString();
  });
  const ref = useRef(null);

  useEffect(() => {
    spring.set(numValue);
  }, [numValue, spring]);

  // Subscribe to motion value changes to update the DOM
  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });
    return unsubscribe;
  }, [display]);

  // For non-numeric values, just render as-is
  if (typeof value === "string" && isNaN(parseFloat(value))) {
    return <span className={className}>{value}</span>;
  }

  return <motion.span ref={ref} className={className} />;
}

/* ── Fade-In wrapper ─────────────────────────────────────────────────── */
// Simple fade-in + optional scale for modals, sections, etc.
export function FadeIn({ children, className = "", delay = 0, scale = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, ...(scale ? { scale: 0.96 } : { y: 8 }) }}
      animate={{ opacity: 1, ...(scale ? { scale: 1 } : { y: 0 }) }}
      exit={{ opacity: 0, ...(scale ? { scale: 0.96 } : { y: -4 }) }}
      transition={{ duration: 0.2, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Modal overlay ───────────────────────────────────────────────────── */
// Animated modal backdrop + centered content
export function ModalOverlay({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Re-export AnimatePresence for convenience
export { AnimatePresence, motion };
