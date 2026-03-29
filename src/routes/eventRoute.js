import express from 'express';
import eventController from '../controller/eventController.js';
import eventRegistrationController from '../controller/eventRegistrationController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/count', eventController.getEventCount);
router.get('/', eventController.getEvents);
router.post('/', auth, eventController.createEvent);
router.delete('/:id', auth, eventController.deleteEvent);

// Registration Routes
router.post('/register', auth, eventRegistrationController.registerForEvent);
router.get('/registrations/:eventId', auth, eventRegistrationController.getEventRegistrations);
router.get('/my-registrations', auth, eventRegistrationController.getMyRegistrations);

export default router;
