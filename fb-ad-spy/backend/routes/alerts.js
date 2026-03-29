const express = require('express');
const db = require('../db/db');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const alerts = db.prepare(
      'SELECT * FROM alerts WHERE team_id = ? ORDER BY created_at DESC'
    ).all(req.user.team_id);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { alert_type, keyword, country, niche, email_to } = req.body;
    if (!alert_type || !email_to) {
      return res.status(400).json({ error: 'alert_type and email_to required' });
    }

    const result = db.prepare(
      'INSERT INTO alerts (team_id, created_by, alert_type, keyword, country, niche, email_to) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.team_id, req.user.id, alert_type, keyword || null, country || null, niche || null, email_to);

    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const alert = db.prepare(
      'SELECT * FROM alerts WHERE id = ? AND team_id = ?'
    ).get(req.params.id, req.user.team_id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const { is_active, email_to, keyword } = req.body;

    if (is_active !== undefined) {
      db.prepare('UPDATE alerts SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, alert.id);
    }
    if (email_to !== undefined) {
      db.prepare('UPDATE alerts SET email_to = ? WHERE id = ?').run(email_to, alert.id);
    }
    if (keyword !== undefined) {
      db.prepare('UPDATE alerts SET keyword = ? WHERE id = ?').run(keyword, alert.id);
    }

    const updated = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alert.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const alert = db.prepare(
      'SELECT * FROM alerts WHERE id = ? AND team_id = ?'
    ).get(req.params.id, req.user.team_id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    db.prepare('DELETE FROM alerts WHERE id = ?').run(alert.id);
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/log', (req, res) => {
  try {
    const logs = db.prepare(
      'SELECT * FROM alerts WHERE team_id = ? AND last_triggered IS NOT NULL ORDER BY last_triggered DESC LIMIT 50'
    ).all(req.user.team_id);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
