// AngularApp\echodrop\backend\src\config\passport.js
import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // {callbackURL: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback",}
  callbackURL: process.env.GOOGLE_REDIRECT_URI || "https://echodrop-backend.onrender.com/auth/google/callback",
  passReqToCallback: true // IMPORTANT: Allows us to access req in the callback
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error("Google profile has no email"));

    // Scenario 1: User is already logged in (linking account)
    // req.user will be set by your JWT middleware if the user is authenticated
    if (req.user) {
      let user = await User.findById(req.user.id); // Find the currently logged-in user
      if (!user) return done(new Error("Authenticated user not found."));

      // Check if this Google account is already linked to another user
      const existingGoogleUser = await User.findOne({ googleId: profile.id });
      if (existingGoogleUser && !existingGoogleUser._id.equals(user._id)) {
        // If the Google account is already linked to a DIFFERENT user, prevent linking
        return done(null, false, { message: "This Google account is already linked to another user." });
      }

      // Link Google details to the existing manual user
      user.googleId = profile.id;
      user.googleAccessToken = accessToken;
      if (refreshToken) { // refreshToken is only provided on first authorization or when user re-authorizes
        user.googleRefreshToken = refreshToken;
      }
      user.profilePicture = profile.photos?.[0]?.value; // Update profile picture
      await user.save();
      return done(null, user); // Return the updated user
    }

    // Scenario 2: User is not logged in (initial login/signup via Google)
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not found
      user = await User.create({
        googleId: profile.id,
        email,
        name: profile.displayName,
        profilePicture: profile.photos?.[0]?.value,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken
      });
    } else if (!user.googleId) {
      // Existing user (e.g., manual signup) but no Google ID yet, update it
      user.googleId = profile.id;
      user.googleAccessToken = accessToken;
      if (refreshToken) {
        user.googleRefreshToken = refreshToken;
      }
      user.profilePicture = profile.photos?.[0]?.value;
      await user.save();
    } else {
      // Existing Google user, just update tokens
      user.googleAccessToken = accessToken;
      if (refreshToken) {
        user.googleRefreshToken = refreshToken;
      }
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Because we are not using sessions, we don't need serializeUser/deserializeUser.
export default passport;
