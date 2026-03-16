import mongoose from 'mongoose';

const MusicSchema = new mongoose.Schema({
    title: String,
    artist: String,
    description: String,
    price: Number,
    category: { type: String, required: [true, "category is required"] },
    subcategory: String, // genre
    brand: String,
    stock: Number,
    type: String,
    
    createdAt: { type: Date, default: Date.now() },
    audioUrls:{
        type: [String],
    },
    
    createdBy : {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: [true, "created by user is required"],
    },
    reactions: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
});

const musicModel = mongoose.model('Music', MusicSchema);

export default musicModel;