require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('./middleware/auth');
const { initAlertEngine } = require('./services/alertEngine');

const authRoutes = require('./routes/auth');
const adsRoutes = require('./routes/ads');
const statsRoutes = require('./routes/stats');
const competitorsRoutes = require('./routes/competitors');
const alertsRoutes = require('./routes/alerts');
const swipefileRoutes = require('./routes/swipefile');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = parseInt(process.env.PORT) || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/ads', verifyToken, adsRoutes);
app.use('/api/stats', verifyToken, statsRoutes);
app.use('/api/competitors', verifyToken, competitorsRoutes);
app.use('/api/alerts', verifyToken, alertsRoutes);
app.use('/api/swipefile', verifyToken, swipefileRoutes);
app.use('/api/ai', verifyToken, aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  initAlertEngine();
});
