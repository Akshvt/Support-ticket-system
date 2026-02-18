import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';
import Toast from './components/Toast';

function App() {
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('submit');
    const [refreshKey, setRefreshKey] = useState(0);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const triggerRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const handleTicketCreated = useCallback(() => {
        triggerRefresh();
        addToast('Ticket created successfully!', 'success');
        setActiveTab('tickets');
    }, [triggerRefresh, addToast]);

    const scrollToSection = (sectionId) => {
        setActiveTab(sectionId);
        const el = document.getElementById('main-content');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="app">
            <Navbar
                theme={theme}
                onToggleTheme={toggleTheme}
                activeTab={activeTab}
                onNavigate={scrollToSection}
            />

            <Hero onGetStarted={() => scrollToSection('submit')} />

            <div className="section-divider" />

            <div id="main-content">
                <div className="section">
                    <div className="tab-nav">
                        <button
                            className={activeTab === 'submit' ? 'active' : ''}
                            onClick={() => setActiveTab('submit')}
                        >
                            ✦ Submit Ticket
                        </button>
                        <button
                            className={activeTab === 'tickets' ? 'active' : ''}
                            onClick={() => setActiveTab('tickets')}
                        >
                            ☰ All Tickets
                        </button>
                        <button
                            className={activeTab === 'stats' ? 'active' : ''}
                            onClick={() => setActiveTab('stats')}
                        >
                            ◈ Dashboard
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'submit' && (
                            <motion.div
                                key="submit"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TicketForm onTicketCreated={handleTicketCreated} />
                            </motion.div>
                        )}

                        {activeTab === 'tickets' && (
                            <motion.div
                                key="tickets"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TicketList
                                    refreshKey={refreshKey}
                                    onStatusChange={() => triggerRefresh()}
                                    addToast={addToast}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'stats' && (
                            <motion.div
                                key="stats"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <StatsDashboard refreshKey={refreshKey} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Toast toasts={toasts} />
        </div>
    );
}

export default App;
