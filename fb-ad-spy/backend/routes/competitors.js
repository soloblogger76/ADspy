const express = require('express');
const db = require('../db/db');
const { fetchAds, enrichAd } = require('../services/fbApi');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const competitors = db.prepare(
      'SELECT * FROM competitors WHERE team_id = ? ORDER BY created_at DESC'
    ).all(req.user.team_id);

    const result = competitors.map(c => {
      const adCount = db.prepare(
        'SELECT COUNT(*) as count FROM competitor_ads WHERE competitor_id = ?'
      ).get(c.id).count;
      const newCount = db.prepare(
        'SELECT COUNT(*) as count FROM competitor_ads WHERE competitor_id = ? AND is_new = 1'
      ).get(c.id).count;
      return { ...c, total_ads: adCount, new_ads: newCount };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { page_id, page_name, niche, notes } = req.body;
    if (!page_id || !page_name) {
      return res.status(400).json({ error: 'page_id and page_name required' });
    }

    const result = db.prepare(
      'INSERT INTO competitors (team_id, added_by, page_id, page_name, niche, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.team_id, req.user.id, page_id, page_name, niche || null, notes || null);

    const competitor = db.prepare('SELECT * FROM competitors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(competitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const competitor = db.prepare(
      'SELECT * FROM competitors WHERE id = ? AND team_id = ?'
    ).get(req.params.id, req.user.team_id);

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    db.prepare('DELETE FROM competitor_ads WHERE competitor_id = ?').run(competitor.id);
    db.prepare('DELETE FROM competitors WHERE id = ?').run(competitor.id);

    res.json({ message: 'Competitor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/ads', async (req, res) => {
  try {
    const competitor = db.prepare(
      'SELECT * FROM competitors WHERE id = ? AND team_id = ?'
    ).get(req.params.id, req.user.team_id);

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    const ads = db.prepare(
      'SELECT * FROM competitor_ads WHERE competitor_id = ? ORDER BY first_seen DESC'
    ).all(competitor.id);

    const parsed = ads.map(a => ({
      ...a,
      ad_data: JSON.parse(a.ad_data_json)
    }));

    db.prepare(
      'UPDATE competitor_ads SET is_new = 0 WHERE competitor_id = ?'
    ).run(competitor.id);

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/check', async (req, res) => {
  try {
    const competitor = db.prepare(
      'SELECT * FROM competitors WHERE id = ? AND team_id = ?'
    ).get(req.params.id, req.user.team_id);

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    const ads = await fetchAds(
      { search_terms: competitor.page_name },
      req.user.team_id
    );

    const pageAds = ads.filter(
      a => (a.page_id === competitor.page_id) || (a.page_name === competitor.page_name)
    );

    const existingIds = db.prepare(
      'SELECT fb_ad_id FROM competitor_ads WHERE competitor_id = ?'
    ).all(competitor.id).map(r => r.fb_ad_id);

    const existingSet = new Set(existingIds);
    let newCount = 0;

    const insert = db.prepare(
      'INSERT INTO competitor_ads (competitor_id, fb_ad_id, ad_data_json, is_new) VALUES (?, ?, ?, 1)'
    );

    for (const ad of pageAds) {
      const adId = ad.fb_ad_id || ad.id;
      if (!existingSet.has(adId)) {
        insert.run(competitor.id, adId, JSON.stringify(ad));
        newCount++;
      }
    }

    db.prepare(
      'UPDATE competitors SET last_checked = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(competitor.id);

    res.json({ new_ads: newCount, total_checked: pageAds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
