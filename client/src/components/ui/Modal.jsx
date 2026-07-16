import { AnimatePresence, motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

/** Neo-Brutalism modal dialog. Controlled via `isOpen` + `onClose`. */
export default function Modal({ isOpen, onClose, title, children, footer }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card-brutal w-full max-w-lg animate-popIn"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">{title}</h2>
              <button
                onClick={onClose}
                className="border-brutal border-black rounded-full p-1 hover:bg-brutal-yellow transition-colors"
                aria-label="Close"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div>{children}</div>

            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
