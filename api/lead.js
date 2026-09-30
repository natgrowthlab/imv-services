const clean = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const name = clean(request.body?.name, 120);
  const email = clean(request.body?.email, 180);
  const phone = clean(request.body?.phone, 60);
  const serviceRequest = clean(request.body?.request, 1500);
  if (!name || !email || !phone || !serviceRequest) return response.status(400).json({ error: 'Missing required fields' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return response.status(500).json({ error: 'Notification service is unavailable' });

  const message = ['New IMV Services lead', '', `Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`, '', `Request: ${serviceRequest}`].join('\n');
  const telegram = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
  if (!telegram.ok) return response.status(502).json({ error: 'Could not deliver notification' });
  return response.status(200).json({ ok: true });
}
