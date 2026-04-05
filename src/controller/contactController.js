import Contact from '../models/ContactModel.js';
import connectToDatabase from '../config/database.js';
import mongoose from 'mongoose';
import sendEmail from '../utils/email.js';
import mainconfig from '../config/index.js';

const submitContact = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }
    const contact = await Contact.create(req.body);
    
    // Notify admin via email
    try {
      await sendEmail(mainconfig.emailUser, {
        subject: `New Contact Form Submission: ${req.body.subject || 'No Subject'}`,
        body: `
          <h3>New Message from Aether Art Hub Contact Form</h3>
          <p><strong>Name:</strong> ${req.body.name}</p>
          <p><strong>Email:</strong> ${req.body.email}</p>
          <p><strong>Message:</strong></p>
          <p>${req.body.message}</p>
        `
      });
    } catch (emailError) {
      console.error("Failed to send contact email notification:", emailError);
    }

    res.status(201).json({ message: "Contact submitted successfully", contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getContacts = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { submitContact, getContacts };
