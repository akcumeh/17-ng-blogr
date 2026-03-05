import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

}, { timestamps: true });

export default mongoose.model<IUser>("User", userSchema);