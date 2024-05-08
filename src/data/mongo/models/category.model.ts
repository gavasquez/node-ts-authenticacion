import mongoose, { Schema } from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
    },
    available: {
        type: Boolean,
        default: false,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }
});

CategorySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret, options) {
        delete ret._id;
    },
});


export const CategoryModel = mongoose.model('category', CategorySchema);