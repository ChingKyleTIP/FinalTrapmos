const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fetch = require('node-fetch');

initializeApp();
const db = getFirestore();

exports.sendTrapmosNotification = onDocumentCreated('Uploads/{uploadId}', async (event) => {
  const data = event.data.data(); // For v2 events

  const title = 'Mosquito Detection Alert!';
  const body = `Detected species: ${data.species || 'Unknown mosquito'}`;

  const tokenDocs = await db.collection('PushTokens').get();

  const messages = [];

  tokenDocs.forEach(doc => {
    const token = doc.data().token;
    if (token && !token.startsWith('ExponentPushToken')) {
      messages.push({
        to: token,
        sound: 'default',
        title,
        body,
      });
    }
  });

  await Promise.all(messages.map(msg =>
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(msg),
    })
  ));
});
