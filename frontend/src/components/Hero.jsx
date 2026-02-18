import { motion } from 'framer-motion';

function Hero({ onGetStarted }) {
    return (
        <section className="hero">
            <div className="hero-bg">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <motion.div
                className="hero-content"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <motion.div
                    className="hero-badge"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <span className="pulse-dot" />
                    AI-Powered Classification
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    Support tickets,{' '}
                    <span className="accent">simplified.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    Submit, track, and manage support tickets with intelligent auto-classification.
                    Let AI handle the triage while you focus on solving problems.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}
                >
                    <button className="btn btn-primary" onClick={onGetStarted}>
                        ✦ Submit a Ticket
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            const el = document.getElementById('main-content');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        View Dashboard →
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
}

export default Hero;
