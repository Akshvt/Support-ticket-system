import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getStats } from '../api/tickets';

const PRIORITY_COLORS = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
};

const CATEGORY_COLORS = {
    billing: '#8b5cf6',
    technical: '#3b82f6',
    account: '#f59e0b',
    general: '#6b7280',
};

function StatsDashboard({ refreshKey }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await getStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [refreshKey]);

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner" />
                Loading dashboard...
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>Dashboard unavailable</h3>
                <p>Unable to load statistics. Please try again.</p>
            </div>
        );
    }

    const priorityData = Object.entries(stats.priority_breakdown || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: PRIORITY_COLORS[name] || '#666',
    }));

    const categoryData = Object.entries(stats.category_breakdown || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: CATEGORY_COLORS[name] || '#666',
    }));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: '0.85rem',
                }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label || payload[0].name}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{payload[0].value} tickets</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Stat Cards */}
            <div className="stats-grid">
                <motion.div className="stat-card" variants={itemVariants}>
                    <div className="stat-label">Total Tickets</div>
                    <div className="stat-value">{stats.total_tickets}</div>
                </motion.div>
                <motion.div className="stat-card" variants={itemVariants}>
                    <div className="stat-label">Open Tickets</div>
                    <div className="stat-value" style={{ color: 'var(--status-open)' }}>{stats.open_tickets}</div>
                </motion.div>
                <motion.div className="stat-card" variants={itemVariants}>
                    <div className="stat-label">Avg / Day</div>
                    <div className="stat-value">{stats.avg_tickets_per_day}</div>
                </motion.div>
                <motion.div className="stat-card" variants={itemVariants}>
                    <div className="stat-label">Resolution Rate</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>
                        {stats.total_tickets > 0
                            ? Math.round(((stats.total_tickets - stats.open_tickets) / stats.total_tickets) * 100)
                            : 0}%
                    </div>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <motion.div className="chart-card" variants={itemVariants}>
                    <h3>Priority Breakdown</h3>
                    {priorityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={priorityData} barSize={40}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {priorityData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                            <p>No data yet</p>
                        </div>
                    )}
                </motion.div>

                <motion.div className="chart-card" variants={itemVariants}>
                    <h3>Category Breakdown</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                            <p>No data yet</p>
                        </div>
                    )}
                    {/* Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
                        {categoryData.map((item) => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                                {item.name} ({item.value})
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default StatsDashboard;
