import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPost extends Document {
    title: string;
    description?: string;
    author: Types.ObjectId;
    scheduledFor?: Date;
    scheduledJobId?: string;
    state: 'draft' | 'published';
    read_count: number;
    reading_time?: number;
    tags: string[];
    body: string
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    author: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduledFor: { type: Date },
    scheduledJobId: { type: String },
    state: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    read_count: {
        type: Number,
        default: 0
    },
    reading_time: Number,
    tags: [String],
    body: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model<IPost>('Post', postSchema);