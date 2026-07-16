import { motion } from 'framer-motion';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brutal-yellow p-4">
      {/* Decorative floating shapes, purely visual, aria-hidden */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-16 left-12 w-16 h-16 bg-brutal-pink border-brutal border-black rounded-brutal rotate-12" />
        <div className="absolute bottom-20 right-16 w-20 h-20 bg-brutal-blue border-brutal border-black rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-10 h-10 bg-brutal-green border-brutal border-black rounded-brutal-sm -rotate-6" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-md card-brutal bg-white"
      >
        <h1 className="font-display font-bold text-3xl mb-1">{title}</h1>
        {subtitle && <p className="text-black/60 font-semibold mb-6">{subtitle}</p>}
        {children}
      </motion.div>
    </div>
  );
}
