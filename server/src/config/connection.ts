import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || 'no_database_specified - update your .env');

export default mongoose.connection;
