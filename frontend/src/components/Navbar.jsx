import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function Navbar({ theme, onToggleTheme, activeTab, onNavigate }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            className={`navbar ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <a href="#" className="navbar-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="brand-icon">⚡</div>
                TicketFlow
            </a>

            <ul className="navbar-links">
                <li>
                    <a
                        href="#submit"
                        className={activeTab === 'submit' ? 'active' : ''}
                        onClick={(e) => { e.preventDefault(); onNavigate('submit'); }}
                    >
                        Submit
                    </a>
                </li>
                <li>
                    <a
                        href="#tickets"
                        className={activeTab === 'tickets' ? 'active' : ''}
                        onClick={(e) => { e.preventDefault(); onNavigate('tickets'); }}
                    >
                        Tickets
                    </a>
                </li>
                <li>
                    <a
                        href="#stats"
                        className={activeTab === 'stats' ? 'active' : ''}
                        onClick={(e) => { e.preventDefault(); onNavigate('stats'); }}
                    >
                        Dashboard
                    </a>
                </li>
            </ul>

            <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
        </motion.nav>
    );
}

export default Navbar;
