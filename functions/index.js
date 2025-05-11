const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const fetch = require('node-fetch');

initializeApp();
const db = getFirestore();

const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    if (data.display_name) {
      const addressParts = data.display_name.split(', ');
      return addressParts.slice(0, -3).join(', ');
    }
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
  }
  return `Lat: ${lat.toFixed(7)}, Lng: ${lng.toFixed(7)}`;
};

exports.sendTrapmosNotification = onDocumentCreated('Uploads/{uploadId}', async (event) => {
  const data = event.data.data(); // For v2 events
  const lat = parseFloat(data.latitude);
  const lng = parseFloat(data.longitude);

  const address = await getAddressFromCoords(lat, lng);

  const title = 'Mosquito Detection Alert!';
  const body = `An Aedes mosquito has been detected in ${address}`;

  const tokenDocs = await db.collection('PushTokens').get();

  const messages = [];
  const tokenDocMap = new Map(); // Map to store token -> doc reference

  // Create messages for all tokens
  tokenDocs.forEach(doc => {
    const token = doc.data().token;
    if (token) { // Remove the ExponentPushToken check to send to all tokens
      messages.push({
        to: token,
        sound: 'default',
        title,
        body,
      });
      tokenDocMap.set(token, doc.ref);
    }
  });

  // Create push history record
  await db.collection("PushHistory").add({
    message: body,
    timestamp: new Date(),
    totalRecipients: messages.length
  });

  const responses = await Promise.all(messages.map(async (msg) => {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(msg),
      });
      
      const result = await response.json();
      
      // If there's an error, delete the token
      if (result.data?.status === 'error') {
        console.log(`Error sending to token ${msg.to}:`, result.data.message);
        const docRef = tokenDocMap.get(msg.to);
        if (docRef) {
          await docRef.delete();
          console.log(`Deleted invalid token: ${msg.to}`);
        }
      }
      
    } catch (error) {
      console.error(`Error processing token ${msg.to}:`, error);
      // Also delete token on fetch error
      const docRef = tokenDocMap.get(msg.to);
      if (docRef) {
        await docRef.delete();
        console.log(`Deleted token due to fetch error: ${msg.to}`);
      }
      return { error };
    }
  }));

  // Update push history with results
  const successCount = responses.filter(r => !r.data?.status || r.data.status !== 'error').length;
  const failureCount = responses.length - successCount;

  await db.collection("PushHistory").add({
    message: `Notification delivery summary for ${data.species || 'Unknown mosquito'}`,
    timestamp: new Date(),
    totalRecipients: messages.length,
    successfulDeliveries: successCount,
    failedDeliveries: failureCount,
    species: data.species || "Unknown mosquito"
  });

  console.log('Notification sending complete. Responses:', responses);
});
