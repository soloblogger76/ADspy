const express = require('express');
const db = require('../db/db');
const { exportToPDF, exportToCSV } = require('../services/exportService');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { collection, search } = req.query;
    let query = 'SELECT * FROM swipe_file WHERE team_id = ?';
    const params = [req.user.team_id];

    if (collection) {
      query += ' AND collection_name = ?';
      params.push(collection);
    }
    if (search) {
      query += ' AND (ad_data_json LIKE ? OR notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY saved_at DESC';
    const rows = db.prepare(query).all(...params);

    const result = rows.map(r => ({
      ...r,
      ad_data: JSON.parse(r.ad_data_json)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { fb_ad_id, ad_data, collection_name, notes } = req.body;
    if (!fb_ad_id || !ad_data) {
      return res.status(400).json({ error: 'fb_ad_id and ad_data required' });
    }

    const existing = db.prepare(
      'SELECT id FROM swipe_file WHERE team_id = ? AND fb_ad_id = ? AND collection_name = ?'
    ).get(req.user.team_id, fb_ad_id, collection_name || 'My Swipe File');

    if (existing) {
      return res.status(409).json({ error: 'Ad already in this collection' });
    }

    const result = db.prepare(
      'INSERT INTO swipe_file (team_id, user_id, fb_ad_id, ad_data_json, collection_name, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      req.user.team_id,
      req.user.id,
      fb_ad_id,
      typeof ad_data === 'string' ? ad_data : JSON.stringify(ad_data),
      collection_name || 'My Swipe File',
      notes || null
    );

    const item = db.prepare('SELECT * FROM swipe_file WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ ...item, ad_data: JSON.parse(item.ad_data_json) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fixed: All specific routes MUST come before /:id wildcard

router.get('/collections', (req, res) => {
  try {
    const collections = db.prepare(
      'SELECT DISTINCT collection_name, COUNT(*) as count FROM swipe_file WHERE team_id = ? GROUP BY collection_name ORDER BY count DESC'
    ).all(req.user.team_id);
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/collection/:name', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM swipe_file WHERE team_id = ? AND collection_name = ? ORDER BY saved_at DESC'
    ).all(req.user.team_id, req.params.name);

    const result = rows.map(r => ({
      ...r,
      ad_data: JSON.parse(r.ad_data_json)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/pdf', async (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM swipe_file WHERE team_id = ? ORDER BY saved_at DESC'
    ).all(req.user.team_id);

    const ads = rows.map(r => JSON.parse(r.ad_data_json));

    const team = db.prepare('SELECT name FROM teams WHERE id = ?').get(req.user.team_id);
    const teamName = team ? team.name : 'Unknown';

    const buffer = await exportToPDF(ads, 'Swipe File Export', teamName);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=swipe-file.pdf');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/csv', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM swipe_file WHERE team_id = ? ORDER BY saved_at DESC'
    ).all(req.user.team_id);

    const ads = rows.map(r => JSON.parse(r.ad_data_json));
    const csv = exportToCSV(ads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=swipe-file.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wildcard /:id routes AFTER all specific routes
router.patch('/:id/notes', (req, res) => {
  try {
    const { notes } = req.body;
    const item = db.prepare(
      'SELECT * FROM swipe_file WHERE id = ? AND team_id = ?'
    ).get(req.params.id, req.user.team_id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    db.prepare('UPDATE swipe_file SET notes = ? WHERE id = ?').run(notes || '', item.id);

    const updated = db.prepare('SELECT * FROM swipe_file WHERE id = ?').get(item.id);
    res.json({ ...updated, ad_data: JSON.parse(updated.ad_data_json) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const item = db.prepare(
      'SELECT * FROM swipe_file WHERE id = ? AND team_id = ?'
    ).get(req.params.id, req.user.team_id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    db.prepare('DELETE FROM swipe_file WHERE id = ?').run(item.id);
    res.json({ message: 'Removed from swipe file' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
