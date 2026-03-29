import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
    },
    subscribedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Subscriber', SubscriberSchema);
