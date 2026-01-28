// AngularApp\echodrop\backend\generate-token.js
import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
  prompt: 'consent' // Force to get refresh token every time
});

console.log('Authorize this app by visiting this URL:', authUrl);
console.log('\nAfter approving, you will be redirected to a page.');
console.log('Copy the code parameter from the URL (looks like "4/0A...") and paste it below.\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the authorization code: ', (code) => {
  rl.close();
  
  oAuth2Client.getToken(code.trim()).then(({ tokens }) => {
    console.log('\n✅ Success! Here are your tokens:');
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Expiry Date:', tokens.expiry_date);
    
    // Save to environment file
    const envPath = '.env';
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    // Remove existing token entries
    envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*\n/g, '');
    envContent = envContent.replace(/GOOGLE_ACCESS_TOKEN=.*\n/g, '');
    
    // Add new tokens
    envContent += `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
    envContent += `GOOGLE_ACCESS_TOKEN=${tokens.access_token}\n`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Tokens saved to .env file!');
    
    // Test the token
    oAuth2Client.setCredentials(tokens);
    console.log('✅ Token is valid and ready to use!');
  }).catch(err => {
    console.error('❌ Error retrieving access token:', err.message);
  });
});
