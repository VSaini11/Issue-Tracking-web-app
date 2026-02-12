const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// INSTRUCTIONS for USER:
// 1. Run this script: node scripts/get-refresh-token.js
// 2. Enter your Client ID and Client Secret when prompted.
// 3. Visit the URL provided.
// 4. Authenticate with your Gmail account.
// 5. Copy the code and paste it back here.
// 6. The script will print your Refresh Token.
// 7. Add these to your .env.local file.

const SCOPES = ['https://mail.google.com/'];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getCredentials = () => {
    return new Promise((resolve) => {
        rl.question('Enter your Google Client ID: ', (clientId) => {
            rl.question('Enter your Google Client Secret: ', (clientSecret) => {
                resolve({
                    clientId: clientId.trim(),
                    clientSecret: clientSecret.trim()
                });
            });
        });
    });
};

const getAccessToken = (oAuth2Client) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('\nAuthorize this app by visiting this url:', authUrl);

    return new Promise((resolve, reject) => {
        rl.question('\nEnter the code from that page here: ', (code) => {
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return reject(err);
                resolve(token);
            });
        });
    });
};

const main = async () => {
    try {
        const { clientId, clientSecret } = await getCredentials();

        if (!clientId || !clientSecret) {
            console.log('Client ID and Secret are required.');
            process.exit(1);
        }

        const oAuth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            'https://developers.google.com/oauthplayground' // Common redirect URI for testing, or use http://localhost
        );

        const token = await getAccessToken(oAuth2Client);

        console.log('\n✅ Successfully retrieved tokens!');
        console.log('\n------------------------------------------------------------');
        console.log('Add these to your .env.local file:\n');
        console.log(`GOOGLE_CLIENT_ID=${clientId}`);
        console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
        console.log('EMAIL_USER=your-email@gmail.com');
        console.log('------------------------------------------------------------\n');

        if (!token.refresh_token) {
            console.warn('⚠️ No refresh token returned. This usually happens if you have already authorized this app before.');
            console.warn('   Go to https://myaccount.google.com/permissions and remove access for this app, then try again.');
        }

    } catch (error) {
        console.error('Error retrieving access token:', error);
    } finally {
        rl.close();
    }
};

main();
