import mongoose from 'mongoose';

const ArtSchema = new mongoose.Schema({
    title: String,
    artist: String,
    description: String,
    price: Number,
    category: String,
     brand: String,
     stock: Number,
    type: String,
    
    createdAt: { type: Date, default: Date.now() },
    imageUrls:{
        type: [String],
    },
    
    createdBy : {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: [true, "created by user is required"],
    },
    description: String,
});

const artModel = mongoose.model('Art', ArtSchema);

export default artModel;