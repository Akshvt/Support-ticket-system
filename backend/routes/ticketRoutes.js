/**
 * Ticket routes — maps HTTP methods + paths to controller functions.
 */
const { Router } = require('express');
const ticketController = require('../controllers/ticketController');

const router = Router();

// Stats must come before :id to avoid "stats" being parsed as an id
router.get('/tickets/stats/', ticketController.getStats);
router.get('/tickets/stats', ticketController.getStats);

// Classify must come before :id
router.post('/tickets/classify/', ticketController.classify);
router.post('/tickets/classify', ticketController.classify);

// CRUD
router.get('/tickets/', ticketController.listTickets);
router.get('/tickets', ticketController.listTickets);

router.post('/tickets/', ticketController.createTicket);
router.post('/tickets', ticketController.createTicket);

router.get('/tickets/:id/', ticketController.getTicket);
router.get('/tickets/:id', ticketController.getTicket);

router.patch('/tickets/:id/', ticketController.updateTicket);
router.patch('/tickets/:id', ticketController.updateTicket);

module.exports = router;
