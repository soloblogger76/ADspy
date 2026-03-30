const db = require('../db/db');
const { categorizeAd } = require('./categorize');
const { calculateScore } = require('./winningScore');
const { estimateRevenue } = require('./revenueEstimator');

const FB_API_VERSION = process.env.FB_API_VERSION || 'v19.0';
const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}/ads_archive`;

const FIELDS = [
  'id', 'ad_creation_time', 'ad_delivery_start_time', 'ad_delivery_stop_time',
  'ad_creative_body', 'ad_creative_link_caption', 'ad_creative_link_title',
  'ad_creative_link_description', 'ad_snapshot_url', 'page_name', 'page_id',
  'ad_reached_countries', 'currency', 'impressions', 'spend', 'bylines',
  'publisher_platforms'
].join(',');

const MAX_ADS = 300;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCacheKey(params) {
  return (params.search_terms || '') + '|' + (params.ad_reached_countries || '');
}

function isCacheValid(teamId, searchQuery) {
  const cacheDuration = parseInt(process.env.CACHE_DURATION_MINUTES) || 60;
  const cutoff = new Date(Date.now() - cacheDuration * 60 * 1000).toISOString();

  const row = db.prepare(
    'SELECT COUNT(*) as count FROM ads_cache WHERE team_id = ? AND search_query = ? AND cached_at > ?'
  ).get(teamId, searchQuery, cutoff);

  return row.count > 0;
}

function getCachedAds(teamId, searchQuery) {
  const rows = db.prepare(
    'SELECT * FROM ads_cache WHERE team_id = ? AND search_query = ?'
  ).all(teamId, searchQuery);

  return rows.map(row => ({
    ...row,
    ad_reached_countries: row.ad_reached_countries ? JSON.parse(row.ad_reached_countries) : [],
    publisher_platforms: row.publisher_platforms ? JSON.parse(row.publisher_platforms) : []
  }));
}

function storeAdsInCache(ads, teamId, searchQuery) {
  db.prepare('DELETE FROM ads_cache WHERE team_id = ? AND search_query = ?').run(teamId, searchQuery);

  const insert = db.prepare(`
    INSERT INTO ads_cache (
      team_id, fb_ad_id, page_name, page_id, ad_creative_body,
      ad_creative_link_title, ad_creative_link_caption, ad_snapshot_url,
      ad_creation_time, ad_delivery_start_time, ad_delivery_stop_time,
      ad_reached_countries, publisher_platforms, niche, domain, funnel_type,
      platform_type, ad_format, winning_score, winning_label, age_category,
      days_running, est_daily_spend_min, est_daily_spend_max,
      est_revenue_min, est_revenue_max, confidence, search_query
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const insertMany = db.transaction((items) => {
    for (const ad of items) {
      insert.run(
        teamId,
        ad.fb_ad_id || ad.id,
        ad.page_name || null,
        ad.page_id || null,
        ad.ad_creative_body || null,
        ad.ad_creative_link_title || null,
        ad.ad_creative_link_caption || null,
        ad.ad_snapshot_url || null,
        ad.ad_creation_time || null,
        ad.ad_delivery_start_time || null,
        ad.ad_delivery_stop_time || null,
        JSON.stringify(ad.ad_reached_countries || []),
        JSON.stringify(ad.publisher_platforms || []),
        ad.niche || null,
        ad.domain || null,
        ad.funnel_type || null,
        ad.platform_type || null,
        ad.ad_format || null,
        ad.winning_score || 0,
        ad.winning_label || null,
        ad.age_category || null,
        ad.days_running || 0,
        ad.est_daily_spend_min || 0,
        ad.est_daily_spend_max || 0,
        ad.est_revenue_min || 0,
        ad.est_revenue_max || 0,
        ad.confidence || null,
        searchQuery
      );
    }
  });

  insertMany(ads);
}

async function fetchFromFacebook(params) {
  const accessToken = process.env.FB_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('FB_ACCESS_TOKEN is not configured');
  }

  const queryParams = new URLSearchParams({
    access_token: accessToken,
    fields: FIELDS,
    ad_type: 'ALL',
    limit: '100'
  });

  if (params.search_terms) {
    queryParams.set('search_terms', params.search_terms);
  }

  if (params.ad_reached_countries) {
    const countries = Array.isArray(params.ad_reached_countries)
      ? params.ad_reached_countries
      : [params.ad_reached_countries];
    queryParams.set('ad_reached_countries', JSON.stringify(countries));
  }

  let allAds = [];
  let url = `${FB_BASE_URL}?${queryParams.toString()}`;
  let hasMore = true;

  while (hasMore && allAds.length < MAX_ADS) {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Facebook API Error: ${data.error.message}`);
    }

    if (data.data && data.data.length > 0) {
      allAds = allAds.concat(data.data);
    }

    if (data.paging && data.paging.cursors && data.paging.cursors.after && data.paging.next) {
      const nextParams = new URLSearchParams(queryParams);
      nextParams.set('after', data.paging.cursors.after);
      url = `${FB_BASE_URL}?${nextParams.toString()}`;
      await sleep(1000);
    } else {
      hasMore = false;
    }
  }

  return allAds.slice(0, MAX_ADS);
}

function enrichAd(rawAd) {
  const ad = {
    fb_ad_id: rawAd.id,
    page_name: rawAd.page_name || '',
    page_id: rawAd.page_id || '',
    ad_creative_body: rawAd.ad_creative_body || '',
    ad_creative_link_title: rawAd.ad_creative_link_title || '',
    ad_creative_link_caption: rawAd.ad_creative_link_caption || '',
    ad_snapshot_url: rawAd.ad_snapshot_url || '',
    ad_creation_time: rawAd.ad_creation_time || '',
    ad_delivery_start_time: rawAd.ad_delivery_start_time || '',
    ad_delivery_stop_time: rawAd.ad_delivery_stop_time || '',
    ad_reached_countries: rawAd.ad_reached_countries || [],
    publisher_platforms: rawAd.publisher_platforms || []
  };

  const categorized = categorizeAd(ad);
  const score = calculateScore(categorized);
  const revenue = estimateRevenue({ ...categorized, ...score });

  return {
    ...categorized,
    ...score,
    est_daily_spend_min: revenue.est_daily_spend_min,
    est_daily_spend_max: revenue.est_daily_spend_max,
    est_revenue_min: revenue.est_revenue_min,
    est_revenue_max: revenue.est_revenue_max,
    confidence: revenue.confidence,
    revenue_formatted: revenue.formatted,
    currency_symbol: revenue.currency_symbol,
    disclaimer: revenue.disclaimer
  };
}

async function fetchAds(params, teamId) {
  const searchQuery = getCacheKey(params);

  if (isCacheValid(teamId, searchQuery)) {
    return getCachedAds(teamId, searchQuery);
  }

  const rawAds = await fetchFromFacebook(params);
  const enrichedAds = rawAds.map(enrichAd);

  storeAdsInCache(enrichedAds, teamId, searchQuery);

  return enrichedAds;
}

async function refreshAds(teamId) {
  const lastQuery = db.prepare(
    'SELECT search_query FROM ads_cache WHERE team_id = ? ORDER BY cached_at DESC LIMIT 1'
  ).get(teamId);

  db.prepare('DELETE FROM ads_cache WHERE team_id = ?').run(teamId);

  if (lastQuery) {
    const parts = lastQuery.search_query.split('|');
    return fetchAds({
      search_terms: parts[0] || '',
      ad_reached_countries: parts[1] || ''
    }, teamId);
  }

  return [];
}

module.exports = { fetchAds, refreshAds, enrichAd };
