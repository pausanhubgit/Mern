import express from 'express';
import eventController from '../controller/eventController.js';
import eventRegistrationController from '../controller/eventRegistrationController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Named routes FIRST — must come before /:id to avoid conflicts
router.get('/count', eventController.getEventCount);
router.get('/my-registrations', auth, eventRegistrationController.getMyRegistrations);
router.get('/registrations/:eventId', auth, eventRegistrationController.getEventRegistrations);
router.post('/register', auth, eventRegistrationController.registerForEvent);

// General CRUD
router.get('/', eventController.getEvents);
router.post('/', auth, eventController.createEvent);

// Dynamic :id routes LAST
router.get('/:id', eventController.getEventById);
router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

export default router;
