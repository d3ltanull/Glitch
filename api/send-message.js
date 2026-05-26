module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  const { email, courseTitle } = body || {};

  if (!email || !courseTitle) {
    return res.status(400).json({ error: "email and courseTitle are required" });
  }

  const emailStr = String(email).trim();
  const courseStr = String(courseTitle).trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (!courseStr || courseStr.length > 200) {
    return res.status(400).json({ error: "Invalid courseTitle" });
  }

  const text = `Новая заявка!\nКурс: ${courseStr}\nEmail: ${emailStr}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok || !tgData.ok) {
      console.error("Telegram API error:", tgData);
      return res.status(502).json({ error: "Failed to send message" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("send-message error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
