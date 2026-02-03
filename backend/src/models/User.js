// AngularApp\EchoDrop-v2\backend\src\models\User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // only for manual login
  defaultChannel: {
    type: String,
    enum: ['email', 'sms', 'whatsapp'],
    default: 'email'
  },
  googleId: { type: String, sparse: true, unique: true },
  profilePicture: String,
  googleAccessToken: String, // New field for Google API access token
  googleRefreshToken: String, // New field for Google API refresh token

  // admin flag
  isAdmin: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema);
