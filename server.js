const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.RESEND_API_KEY;
const TO = process.env.RESEND_TO || 'service@concordlock.com';
const FROM = process.env.RESEND_FROM || 'Concord Locksmith Contact <noreply@concordlock.com>';

if (!API_KEY) {
  console.error('RESEND_API_KEY is not set');
  process.exit(1);
}

const resend = new Resend(API_KEY);
const app = express();

app.use(express.json({ limit: '64kb' }));

// Canonical host: redirect www → apex
app.use((req, res, next) => {
  const host = req.headers.host || '';
  if (host.toLowerCase().startsWith('www.')) {
    return res.redirect(301, 'https://' + host.slice(4) + req.url);
  }
  next();
});

// Canonical paths: strip trailing slashes (except root)
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, req.path.replace(/\/+$/, '') + query);
  }
  next();
});

// Canonical clean URLs: redirect /foo.html → /foo
app.get(/^\/(.+)\.html$/i, (req, res) => {
  const target = '/' + req.params[0] + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
  res.redirect(301, target);
});

// Legacy flat service URLs → /services/<slug>
const SERVICE_SLUGS = ['residential', 'commercial', 'automotive', 'safes', 'keyless', 'self-defense'];
app.get(SERVICE_SLUGS.map(s => '/' + s), (req, res) => {
  res.redirect(301, '/services' + req.path);
});

// /services is both a page (services.html) and a directory of service pages —
// serve the hub page explicitly so the static middleware's directory redirect
// (/services → /services/) can't fight the trailing-slash stripper above.
app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'services.html'));
});

// Static, with .html extension auto-resolution: /services/safes → services/safes.html
// redirect:false — directory slash-redirects would loop with the stripper above
app.use(express.static(__dirname, {
  extensions: ['html'],
  redirect: false,
  setHeaders(res, filePath) {
    if (/\.(png|jpe?g|webp|ico|svg|mp4)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    } else if (/\.(css|js)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else if (/\.html$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  },
}));

app.post('/api/contact', async (req, res) => {
  const body = req.body || {};
  const name = String(body['full-name'] || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 200);
  const phone = String(body.phone || '').trim().slice(0, 50);
  const service = String(body.service || '').trim().slice(0, 100);
  const message = String(body.message || '').trim().slice(0, 5000);

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email.' });
  }

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    service ? `Service: ${service}` : null,
    '',
    'Message:',
    message,
  ].filter(l => l !== null);

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `New contact form: ${name}`,
      text: lines.join('\n'),
    });
    if (result.error) {
      console.error('Resend API error:', result.error);
      return res.status(502).json({ error: 'Email service error.' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Send failed:', err);
    res.status(500).json({ error: 'Failed to send.' });
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
