// AngularApp\echodrop\backend\src\models\list-users.js
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../src/models/User.js';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const users = await User.find({}, { email: 1, googleRefreshToken: 1 }).lean();
    console.log('USERS:', users);
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err);
    process.exit(1);
  }
})();
