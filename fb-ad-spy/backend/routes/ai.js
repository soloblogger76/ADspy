const express = require('express');
const db = require('../db/db');
const { analyzeAd, generateAdCopy } = require('../services/aiAnalyzer');

const router = express.Router();

function getAdById(fbAdId, teamId) {
  const row = db.prepare(
    'SELECT * FROM ads_cache WHERE fb_ad_id = ? AND team_id = ?'
  ).get(fbAdId, teamId);

  if (row) {
    return {
      ...row,
      ad_reached_countries: row.ad_reached_countries ? JSON.parse(row.ad_reached_countries) : [],
      publisher_platforms: row.publisher_platforms ? JSON.parse(row.publisher_platforms) : []
    };
  }

  const swipeRow = db.prepare(
    'SELECT ad_data_json FROM swipe_file WHERE fb_ad_id = ? AND team_id = ?'
  ).get(fbAdId, teamId);

  if (swipeRow) {
    return JSON.parse(swipeRow.ad_data_json);
  }

  return null;
}

router.post('/analyze', async (req, res) => {
  try {
    const { ad_id } = req.body;
    if (!ad_id) {
      return res.status(400).json({ error: 'ad_id required' });
    }

    const ad = getAdById(ad_id, req.user.team_id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const analysis = await analyzeAd(ad, req.user.team_id);
    res.json(analysis);
  } catch (err) {
    console.error('AI analyze error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { ad_id, user_product } = req.body;
    if (!ad_id || !user_product) {
      return res.status(400).json({ error: 'ad_id and user_product required' });
    }

    const ad = getAdById(ad_id, req.user.team_id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const result = await generateAdCopy(ad, user_product, req.user.team_id);
    res.json(result);
  } catch (err) {
    console.error('AI generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM ai_analyses WHERE team_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(req.user.team_id);

    const result = rows.map(r => ({
      ...r,
      analysis: r.analysis_json ? JSON.parse(r.analysis_json) : null,
      generated_copy: r.generated_copy_json ? JSON.parse(r.generated_copy_json) : null
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
