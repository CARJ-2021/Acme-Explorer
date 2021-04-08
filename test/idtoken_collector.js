const admin = require('firebase-admin');
const rp = require('request-promise');

module.exports.getIdToken = async (email) => {

  const customToken = await admin.auth().createCustomToken(email);
  const res = await rp({
    url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${process.env.apikey}`,
    method: 'POST',
    body: {
      token: customToken,
      returnSecureToken: true
    },
    json: true,
  });
  return res.idToken;
};