import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTickets, updateTicket } from '../api/tickets';

const CATEGORIES = ['billing', 'technical', 'account', 'general'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function TicketList({ refreshKey, onStatusChange, addToast }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTickets({
                category: filterCategory || undefined,
                priority: filterPriority || undefined,
                status: filterStatus || undefined,
                search: search || undefined,
            });
            setTickets(data);
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
            addToast('Failed to load tickets', 'error');
        } finally {
            setLoading(false);
        }
    }, [filterCategory, filterPriority, filterStatus, search, addToast]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets, refreshKey]);

    // Debounced search
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await updateTicket(ticketId, { status: newStatus });
            setTickets(prev =>
                prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
            );
            onStatusChange();
            addToast(`Ticket status updated to ${newStatus.replace('_', ' ')}`, 'success');
        } catch (err) {
            console.error('Failed to update status:', err);
            addToast('Failed to update ticket status', 'error');
        }
    };

    const clearFilters = () => {
        setFilterCategory('');
        setFilterPriority('');
        setFilterStatus('');
        setSearchInput('');
        setSearch('');
    };

    const hasActiveFilters = filterCategory || filterPriority || filterStatus || search;

    return (
        <div>
            {/* Filters Bar */}
            <div className="filters-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Search tickets by title or description..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        className="form-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ width: 'auto', minWidth: 130 }}
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        style={{ width: 'auto', minWidth: 130 }}
                    >
                        <option value="">All Priorities</option>
                        {PRIORITIES.map(p => (
                            <option key={p} value={p}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: 'auto', minWidth: 130 }}
                    >
                        <option value="">All Statuses</option>
                        {STATUSES.map(s => (
                            <option key={s} value={s}>
                                {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                            ✕ Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Ticket Count */}
            {!loading && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                    {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner" />
                    Loading tickets...
                </div>
            )}

            {/* Empty State */}
            {!loading && tickets.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No tickets found</h3>
                    <p>
                        {hasActiveFilters
                            ? 'Try adjusting your filters or search terms.'
                            : 'Submit your first ticket to get started!'}
                    </p>
                </div>
            )}

            {/* Ticket List */}
            <div className="ticket-grid">
                <AnimatePresence>
                    {tickets.map((ticket, index) => (
                        <motion.div
                            key={ticket.id}
                            className={`ticket-card priority-${ticket.priority}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            layout
                        >
                            <div className="ticket-card-header">
                                <div className="ticket-title">{ticket.title}</div>
                                <select
                                    className="status-select-inline"
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {STATUSES.map(s => (
                                        <option key={s} value={s}>
                                            {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ticket-description">{ticket.description}</div>

                            <div className="ticket-meta">
                                <span className="badge badge-category">{ticket.category}</span>
                                <span className={`badge badge-priority ${ticket.priority}`}>{ticket.priority}</span>
                                <span className={`badge badge-status ${ticket.status}`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                                <span className="ticket-time">{formatTime(ticket.created_at)}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default TicketList;
