const express = require('express');
const db = require('../db/db');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const teamId = req.user.team_id;

    const totalAds = db.prepare('SELECT COUNT(*) as count FROM ads_cache WHERE team_id = ?').get(teamId).count;
    const activeAds = db.prepare(
      'SELECT COUNT(*) as count FROM ads_cache WHERE team_id = ? AND ad_delivery_stop_time IS NULL'
    ).get(teamId).count;
    const inactiveAds = totalAds - activeAds;

    const nichesRows = db.prepare(
      'SELECT niche, COUNT(*) as count FROM ads_cache WHERE team_id = ? GROUP BY niche ORDER BY count DESC'
    ).all(teamId);
    const byNiche = {};
    nichesRows.forEach(r => { byNiche[r.niche || 'Other'] = r.count; });

    const countriesRows = db.prepare(
      'SELECT ad_reached_countries FROM ads_cache WHERE team_id = ?'
    ).all(teamId);

    const byCountry = {};
    countriesRows.forEach(row => {
      try {
        const countries = JSON.parse(row.ad_reached_countries || '[]');
        countries.forEach(c => {
          byCountry[c] = (byCountry[c] || 0) + 1;
        });
      } catch (e) {
        // skip malformed
      }
    });

    const byAge = { new: 0, recent: 0, old: 0 };
    const ageRows = db.prepare(
      'SELECT age_category, COUNT(*) as count FROM ads_cache WHERE team_id = ? GROUP BY age_category'
    ).all(teamId);
    ageRows.forEach(r => {
      if (r.age_category && byAge.hasOwnProperty(r.age_category)) {
        byAge[r.age_category] = r.count;
      }
    });

    const domainRows = db.prepare(`
      SELECT domain, COUNT(*) as count, niche,
             GROUP_CONCAT(DISTINCT ad_reached_countries) as countries_raw
      FROM ads_cache
      WHERE team_id = ? AND domain IS NOT NULL AND domain != ''
      GROUP BY domain
      ORDER BY count DESC
      LIMIT 20
    `).all(teamId);

    const topDomains = domainRows.map(r => ({
      domain: r.domain,
      count: r.count,
      top_niche: r.niche,
      countries: r.countries_raw || ''
    }));

    const saturationNiches = nichesRows.slice(0, 5).map(r => {
      const nicheAds = db.prepare(
        'SELECT COUNT(*) as total, AVG(days_running) as avg_days FROM ads_cache WHERE team_id = ? AND niche = ?'
      ).get(teamId, r.niche);

      let score = Math.min(100, Math.round((nicheAds.total / Math.max(totalAds, 1)) * 100 + (nicheAds.avg_days || 0) / 2));
      let label;
      if (score >= 80) label = 'Oversaturated';
      else if (score >= 60) label = 'High Competition';
      else if (score >= 40) label = 'Moderate';
      else if (score >= 20) label = 'Growing';
      else label = 'Emerging';

      return { niche: r.niche, score, label };
    });

    const trendRows = db.prepare(`
      SELECT
        strftime('%Y-%m', ad_delivery_start_time) as month,
        niche,
        SUM(est_daily_spend_max) as est_spend
      FROM ads_cache
      WHERE team_id = ? AND ad_delivery_start_time IS NOT NULL
      GROUP BY month, niche
      ORDER BY month DESC
      LIMIT 60
    `).all(teamId);

    const trendMap = {};
    trendRows.forEach(r => {
      if (!r.month) return;
      if (!trendMap[r.month]) trendMap[r.month] = {};
      trendMap[r.month][r.niche || 'Other'] = Math.round(r.est_spend || 0);
    });

    const trend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, niches]) => ({ month, niches }));

    const revenueRow = db.prepare(
      'SELECT SUM(est_revenue_min) as total_min, SUM(est_revenue_max) as total_max FROM ads_cache WHERE team_id = ?'
    ).get(teamId);

    res.json({
      total_ads: totalAds,
      active_ads: activeAds,
      inactive_ads: inactiveAds,
      niches_count: nichesRows.length,
      countries_count: Object.keys(byCountry).length,
      by_niche: byNiche,
      by_country: byCountry,
      by_age: byAge,
      top_domains: topDomains,
      saturation: saturationNiches,
      trend,
      total_est_revenue_min: Math.round(revenueRow.total_min || 0),
      total_est_revenue_max: Math.round(revenueRow.total_max || 0)
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
