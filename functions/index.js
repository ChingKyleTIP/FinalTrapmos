const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fetch = require("node-fetch");

initializeApp();
const db = getFirestore();

exports.sendTrapmosNotification = onDocumentCreated("Uploads/{docId}", async (event) => {
  const snap = event.data;
  if (!snap) return;

  const data = snap.data();

  const notification = {
    title: "🚨 Aedes Mosquito Detected!",
    body: `Device: ${data.device || "Unknown"} — Tap to view location.`,
    sound: "default",
    data: {
      file: data.file || "",
      latitude: String(data.latitude || ""),
      longitude: String(data.longitude || ""),
    },
  };

  try {
    const tokensSnapshot = await db.collection("PushTokens").get();
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(Boolean);

    if (tokens.length === 0) {
      console.log("⚠️ No push tokens found.");
      return;
    }

    const messages = tokens.map(token => ({ to: token, ...notification }));

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await res.json();
    console.log("✅ Expo push result:", result);

    // 🧹 Remove invalid push tokens
    result.data.forEach((resp, idx) => {
      if (resp.status === 'error' && resp.details?.error === 'DeviceNotRegistered') {
        const invalidToken = tokens[idx];
        console.warn(`🗑 Removing invalid token: ${invalidToken}`);
        db.collection("PushTokens")
          .where("token", "==", invalidToken)
          .get()
          .then(snapshot => {
            snapshot.forEach(doc => doc.ref.delete());
          });
      }
    });

    // 📝 Log the notification to PushHistory
    await db.collection("PushHistory").add({
      message: notification.body,
      file: data.file || "",
      device: data.device || "",
      timestamp: new Date(),
    });

  } catch (error) {
    console.error("🔥 Error sending push:", error);
  }
});
