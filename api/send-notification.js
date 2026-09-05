/**
 * Vercel Serverless Function: /api/send-notification
 *
 * Sends a Web Push notification to a subscribed browser.
 * Requires env vars:
 *   VAPID_PUBLIC_KEY  - from: npx web-push generate-vapid-keys
 *   VAPID_PRIVATE_KEY - from: npx web-push generate-vapid-keys
 *   VAPID_EMAIL       - e.g. mailto:your@email.com
 *
 * Usage: POST /api/send-notification
 * Body: { subscription, title, body, data }
 */

const webpush = require("web-push");

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // CORS for development
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { subscription, title, body, data, tag } = req.body || {};

  if (!subscription) {
    return res.status(400).json({ error: "Missing push subscription" });
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@lisa.app";

  if (!vapidPublicKey || !vapidPrivateKey) {
    return res.status(500).json({
      error: "VAPID keys not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Vercel env vars.",
    });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

  const payload = JSON.stringify({
    title: title || "LISA Learning Reminder",
    body: body || "Time for today's lesson! 📚",
    icon: "/icon.png",
    badge: "/icon.png",
    tag: tag || "lisa-reminder",
    data: data || { url: "/" },
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return res.status(200).json({ success: true, message: "Notification sent" });
  } catch (err) {
    console.error("Push error:", err);
    // 410 = subscription expired/invalid — client should remove it
    if (err.statusCode === 410) {
      return res.status(410).json({ error: "Subscription expired", expired: true });
    }
    return res.status(500).json({ error: "Failed to send notification", details: err.message });
  }
};
