import { motion } from 'framer-motion';

const VARIANT_BG = {
  yellow: 'bg-brutal-yellow',
  blue: 'bg-brutal-blue text-white',
  pink: 'bg-brutal-pink text-white',
  green: 'bg-brutal-green',
  orange: 'bg-brutal-orange',
  white: 'bg-white',
  black: 'bg-black text-white',
};

/**
 * Neo-Brutalism button. `variant` picks the flat fill color from the palette;
 * `size` toggles between the standard and compact border/shadow scale.
 */
export default function Button({
  children,
  variant = 'yellow',
  size = 'md',
  className = '',
  ...props
}) {
  const base = size === 'sm' ? 'btn-brutal-sm' : 'btn-brutal';
  const bg = VARIANT_BG[variant] || VARIANT_BG.yellow;

  return (
    <motion.button whileTap={{ scale: 0.97 }} className={`${base} ${bg} ${className}`} {...props}>
      {children}
    </motion.button>
  );
}
