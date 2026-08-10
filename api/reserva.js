export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  const { nombre = 'Yulexcys Nuñez', fecha, hora, direccion } = req.body || {};

  if (!fecha || !hora || !direccion || String(direccion).trim().length < 4) {
    return res.status(400).json({ ok: false, error: 'Completa fecha, hora y dirección.' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID');
    return res.status(500).json({ ok: false, error: 'La notificación todavía no está configurada.' });
  }

  const cleanAddress = String(direccion).trim().slice(0, 240);
  const bookingCode = `YUL-${fecha.replaceAll('-', '')}-${hora.replace(':', '')}`;
  const text = [
    '🎁 *NUEVA RESERVA — REGALO YULEXCYS*',
    '',
    '💅 Manicurista a domicilio',
    `👤 ${nombre}`,
    `📅 Fecha: ${fecha}`,
    `🕒 Hora: ${hora}`,
    `📍 Dirección: ${cleanAddress}`,
    '',
    '✅ Reserva confirmada desde la invitación.',
    `🎟 Código: ${bookingCode}`
  ].join('\n');

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });

    const data = await tg.json();
    if (!tg.ok || !data.ok) {
      console.error('Telegram error:', data);
      return res.status(502).json({ ok: false, error: 'No se pudo enviar la notificación.' });
    }

    return res.status(200).json({ ok: true, bookingCode });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'Error interno al confirmar la reserva.' });
  }
}
