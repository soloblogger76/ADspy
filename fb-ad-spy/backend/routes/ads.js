const express = require('express');
const db = require('../db/db');
const { fetchAds, refreshAds } = require('../services/fbApi');

const router = express.Router();

function parseAdRow(row) {
  return {
    ...row,
    ad_reached_countries: row.ad_reached_countries ? JSON.parse(row.ad_reached_countries) : [],
    publisher_platforms: row.publisher_platforms ? JSON.parse(row.publisher_platforms) : []
  };
}

router.get('/', async (req, res) => {
  try {
    const teamId = req.user.team_id;
    const {
      search, country, niche, age, platform, format, funnel,
      sort = 'newest', page = 1, limit = 20
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    if (search || country) {
      const params = {};
      if (search) params.search_terms = search;
      if (country) params.ad_reached_countries = [country];
      await fetchAds(params, teamId);
    }

    let query = 'SELECT * FROM ads_cache WHERE team_id = ?';
    const queryParams = [teamId];

    if (search) {
      query += ' AND (ad_creative_body LIKE ? OR page_name LIKE ? OR ad_creative_link_title LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (country) {
      query += ' AND ad_reached_countries LIKE ?';
      queryParams.push(`%${country}%`);
    }
    if (niche) {
      query += ' AND niche = ?';
      queryParams.push(niche);
    }
    if (age) {
      query += ' AND age_category = ?';
      queryParams.push(age);
    }
    if (platform) {
      query += ' AND platform_type LIKE ?';
      queryParams.push(`%${platform}%`);
    }
    if (format) {
      query += ' AND ad_format = ?';
      queryParams.push(format);
    }
    if (funnel) {
      query += ' AND funnel_type = ?';
      queryParams.push(funnel);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const totalRow = db.prepare(countQuery).get(...queryParams);
    const total = totalRow.total;

    switch (sort) {
      case 'oldest':
        query += ' ORDER BY ad_delivery_start_time ASC';
        break;
      case 'score':
        query += ' ORDER BY winning_score DESC';
        break;
      case 'revenue':
        query += ' ORDER BY est_revenue_max DESC';
        break;
      default:
        query += ' ORDER BY ad_delivery_start_time DESC';
    }

    const offset = (pageNum - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limitNum, offset);

    const rows = db.prepare(query).all(...queryParams);
    const ads = rows.map(parseAdRow);

    res.json({
      ads,
      total,
      page: pageNum,
      total_pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error('Fetch ads error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/refresh', async (req, res) => {
  try {
    const ads = await refreshAds(req.user.team_id);
    res.json({ ads, total: ads.length });
  } catch (err) {
    console.error('Refresh ads error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/niche/:niche', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM ads_cache WHERE team_id = ? AND niche = ? ORDER BY winning_score DESC'
    ).all(req.user.team_id, req.params.niche);

    res.json({ ads: rows.map(parseAdRow), total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/country/:code', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM ads_cache WHERE team_id = ? AND ad_reached_countries LIKE ? ORDER BY winning_score DESC'
    ).all(req.user.team_id, `%${req.params.code}%`);

    res.json({ ads: rows.map(parseAdRow), total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/age/:filter', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM ads_cache WHERE team_id = ? AND age_category = ? ORDER BY winning_score DESC'
    ).all(req.user.team_id, req.params.filter);

    res.json({ ads: rows.map(parseAdRow), total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:fb_ad_id', (req, res) => {
  try {
    const row = db.prepare(
      'SELECT * FROM ads_cache WHERE team_id = ? AND fb_ad_id = ?'
    ).get(req.user.team_id, req.params.fb_ad_id);

    if (!row) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json(parseAdRow(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/compare', (req, res) => {
  try {
    const { ad_ids } = req.body;
    if (!ad_ids || !Array.isArray(ad_ids) || ad_ids.length === 0) {
      return res.status(400).json({ error: 'ad_ids array required' });
    }

    const ids = ad_ids.slice(0, 3);
    const placeholders = ids.map(() => '?').join(',');
    const rows = db.prepare(
      `SELECT * FROM ads_cache WHERE team_id = ? AND fb_ad_id IN (${placeholders})`
    ).all(req.user.team_id, ...ids);

    res.json(rows.map(parseAdRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
