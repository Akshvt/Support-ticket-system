import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createTicket, classifyTicket } from '../api/tickets';

const CATEGORIES = ['billing', 'technical', 'account', 'general'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function TicketForm({ onTicketCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isClassifying, setIsClassifying] = useState(false);
    const [classifySuggested, setClassifySuggested] = useState(false);
    const [error, setError] = useState('');

    const handleClassify = useCallback(async () => {
        if (!description.trim() || description.trim().length < 10) return;

        setIsClassifying(true);
        setClassifySuggested(false);
        try {
            const result = await classifyTicket(description);
            if (result.suggested_category) {
                setCategory(result.suggested_category);
            }
            if (result.suggested_priority) {
                setPriority(result.suggested_priority);
            }
            if (result.suggested_category || result.suggested_priority) {
                setClassifySuggested(true);
            }
        } catch (err) {
            console.error('Classification failed:', err);
            // Fail silently — user can still select manually
        } finally {
            setIsClassifying(false);
        }
    }, [description]);

    const handleDescriptionBlur = () => {
        if (description.trim().length >= 10 && !category && !priority) {
            handleClassify();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required.');
            return;
        }
        if (!description.trim()) {
            setError('Description is required.');
            return;
        }
        if (!category) {
            setError('Please select a category.');
            return;
        }
        if (!priority) {
            setError('Please select a priority level.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createTicket({
                title: title.trim(),
                description: description.trim(),
                category,
                priority,
            });

            // Clear form
            setTitle('');
            setDescription('');
            setCategory('');
            setPriority('');
            setClassifySuggested(false);
            setError('');

            onTicketCreated();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className="glass-card"
            style={{ maxWidth: 680, margin: '0 auto' }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Submit a Ticket
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Describe your issue and our AI will suggest a category and priority.
            </p>

            {error && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                        padding: '12px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--priority-critical)',
                        fontSize: '0.85rem',
                        marginBottom: '16px',
                    }}
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="ticket-title">Title</label>
                    <input
                        id="ticket-title"
                        className="form-input"
                        type="text"
                        placeholder="Brief summary of your issue"
                        value={title}
                        onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                        maxLength={200}
                        required
                    />
                    <div className={`char-count ${title.length > 180 ? 'warn' : ''}`}>
                        {title.length}/200
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="ticket-description">Description</label>
                    <textarea
                        id="ticket-description"
                        className="form-textarea"
                        placeholder="Describe your issue in detail. Our AI will analyze this to suggest a category and priority..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        required
                    />
                    <div className="form-hint">
                        The AI will auto-classify when you click away from this field.
                    </div>
                </div>

                {isClassifying && (
                    <div className="classify-loading">
                        <div className="spinner" />
                        AI is analyzing your ticket...
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="ticket-category">
                            Category
                            {classifySuggested && category && (
                                <span className="suggested-badge" style={{ marginLeft: 8 }}>
                                    ✦ AI Suggested
                                </span>
                            )}
                        </label>
                        <select
                            id="ticket-category"
                            className="form-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select category...</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="ticket-priority">
                            Priority
                            {classifySuggested && priority && (
                                <span className="suggested-badge" style={{ marginLeft: 8 }}>
                                    ✦ AI Suggested
                                </span>
                            )}
                        </label>
                        <select
                            id="ticket-priority"
                            className="form-select"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            required
                        >
                            <option value="">Select priority...</option>
                            {PRIORITIES.map(p => (
                                <option key={p} value={p}>
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                        style={{ flex: 1 }}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner" style={{ borderTopColor: 'white' }} />
                                Submitting...
                            </>
                        ) : (
                            '✦ Submit Ticket'
                        )}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClassify}
                        disabled={isClassifying || !description.trim()}
                    >
                        {isClassifying ? (
                            <>
                                <div className="spinner" />
                                Classifying...
                            </>
                        ) : (
                            '⚡ Re-classify'
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}

export default TicketForm;
