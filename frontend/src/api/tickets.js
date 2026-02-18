import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Fetch all tickets with optional filters.
 */
export async function getTickets({ category, priority, status, search } = {}) {
    const params = {};
    if (category) params.category = category;
    if (priority) params.priority = priority;
    if (status) params.status = status;
    if (search) params.search = search;

    const response = await api.get('/tickets/', { params });
    return response.data;
}

/**
 * Create a new ticket.
 */
export async function createTicket(ticketData) {
    const response = await api.post('/tickets/', ticketData);
    return response.data;
}

/**
 * Update a ticket (PATCH).
 */
export async function updateTicket(id, data) {
    const response = await api.patch(`/tickets/${id}/`, data);
    return response.data;
}

/**
 * Get aggregated stats.
 */
export async function getStats() {
    const response = await api.get('/tickets/stats/');
    return response.data;
}

/**
 * Classify a ticket description using LLM.
 */
export async function classifyTicket(description) {
    const response = await api.post('/tickets/classify/', { description });
    return response.data;
}
