import { AnimatePresence, motion } from 'framer-motion';

function Toast({ toasts }) {
    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        className={`toast ${toast.type}`}
                        initial={{ opacity: 0, y: 20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.3 }}
                    >
                        {toast.type === 'success' && '✓ '}
                        {toast.type === 'error' && '✕ '}
                        {toast.type === 'info' && 'ℹ '}
                        {toast.message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default Toast;
