import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("connected to db");
    } catch (e) {
        console.error("error connecting:", (e as Error).message);
        process.exit(1);
    }
};

export default connectDB;