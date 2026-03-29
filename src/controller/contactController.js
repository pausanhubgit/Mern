import Contact from '../models/ContactModel.js';
import connectToDatabase from '../config/database.js';
import mongoose from 'mongoose';

const submitContact = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }
    const contact = await Contact.create(req.body);
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
