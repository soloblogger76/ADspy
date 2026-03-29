const cron = require('node-cron');
const nodemailer = require('nodemailer');
const db = require('../db/db');
const { fetchAds } = require('./fbApi');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function buildEmailHtml(alert, newAds) {
  const adsHtml = newAds.map(ad => {
    const data = typeof ad === 'string' ? JSON.parse(ad) : ad;
    const snippet = (data.ad_creative_body || '').substring(0, 100);
    const fbUrl = `https://www.facebook.com/ads/library/?id=${data.fb_ad_id || data.id}`;
    return `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 12px; color: #f1f5f9;">${data.page_name || 'Unknown'}</td>
        <td style="padding: 12px; color: #94a3b8;">${data.niche || 'N/A'}</td>
        <td style="padding: 12px; color: #94a3b8;">${data.days_running || 0} days</td>
        <td style="padding: 12px; color: #94a3b8;">${snippet}${snippet.length >= 100 ? '...' : ''}</td>
        <td style="padding: 12px;"><a href="${fbUrl}" style="color: #3b82f6;">View Ad</a></td>
      </tr>`;
  }).join('');

  return `
    <div style="font-family: Arial, sans-serif; background: #0a0a0a; padding: 24px; color: #f1f5f9;">
      <h2 style="color: #3b82f6;">New Ads Alert</h2>
      <p>Keyword: <strong>${alert.keyword || 'Any'}</strong> | Country: <strong>${alert.country || 'All'}</strong> | Niche: <strong>${alert.niche || 'All'}</strong></p>
      <p>${newAds.length} new ad(s) found:</p>
      <table style="width: 100%; border-collapse: collapse; background: #111;">
        <thead>
          <tr style="background: #1f1f1f;">
            <th style="padding: 12px; text-align: left; color: #94a3b8;">Page</th>
            <th style="padding: 12px; text-align: left; color: #94a3b8;">Niche</th>
            <th style="padding: 12px; text-align: left; color: #94a3b8;">Running</th>
            <th style="padding: 12px; text-align: left; color: #94a3b8;">Text</th>
            <th style="padding: 12px; text-align: left; color: #94a3b8;">Link</th>
          </tr>
        </thead>
        <tbody>${adsHtml}</tbody>
      </table>
      <p style="color: #64748b; margin-top: 16px; font-size: 12px;">Sent by FB Ad Spy Tool</p>
    </div>`;
}

async function processAlert(alert) {
  try {
    const params = {};
    if (alert.keyword) params.search_terms = alert.keyword;
    if (alert.country) params.ad_reached_countries = [alert.country];

    const ads = await fetchAds(params, alert.team_id);

    const existingIds = db.prepare(
      'SELECT fb_ad_id FROM competitor_ads WHERE competitor_id IN (SELECT id FROM competitors WHERE team_id = ?)'
    ).all(alert.team_id).map(r => r.fb_ad_id);

    const alertAdIds = db.prepare(
      'SELECT fb_ad_id FROM ads_cache WHERE team_id = ?'
    ).all(alert.team_id).map(r => r.fb_ad_id);

    const seenIds = new Set([...existingIds, ...alertAdIds]);

    let filteredAds = ads;
    if (alert.niche) {
      filteredAds = filteredAds.filter(ad => ad.niche === alert.niche);
    }

    const newAds = filteredAds.filter(ad => {
      const adId = ad.fb_ad_id || ad.id;
      return !seenIds.has(adId);
    });

    if (newAds.length === 0) return 0;

    const insertAd = db.prepare(
      'INSERT INTO competitor_ads (competitor_id, fb_ad_id, ad_data_json, is_new) VALUES (?, ?, ?, 1)'
    );

    const firstCompetitor = db.prepare(
      'SELECT id FROM competitors WHERE team_id = ? LIMIT 1'
    ).get(alert.team_id);

    if (firstCompetitor) {
      for (const ad of newAds) {
        insertAd.run(firstCompetitor.id, ad.fb_ad_id || ad.id, JSON.stringify(ad));
      }
    }

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = createTransporter();
      const subject = `New Ads Alert \u2014 ${alert.keyword || 'Monitored'} in ${alert.country || 'All Countries'}`;

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: alert.email_to,
        subject,
        html: buildEmailHtml(alert, newAds)
      });
    }

    db.prepare('UPDATE alerts SET last_triggered = CURRENT_TIMESTAMP WHERE id = ?').run(alert.id);

    return newAds.length;
  } catch (err) {
    console.error(`Alert ${alert.id} processing error:`, err.message);
    return 0;
  }
}

async function runAlertCheck() {
  console.log('[AlertEngine] Running alert check...');
  const activeAlerts = db.prepare('SELECT * FROM alerts WHERE is_active = 1').all();

  for (const alert of activeAlerts) {
    const count = await processAlert(alert);
    if (count > 0) {
      console.log(`[AlertEngine] Alert ${alert.id}: Found ${count} new ads`);
    }
  }
  console.log('[AlertEngine] Alert check complete.');
}

function initAlertEngine() {
  const hours = parseInt(process.env.ALERT_CHECK_HOURS) || 6;
  const cronExpression = `0 */${hours} * * *`;

  cron.schedule(cronExpression, () => {
    runAlertCheck().catch(err => console.error('[AlertEngine] Error:', err));
  });

  console.log(`[AlertEngine] Initialized. Checking every ${hours} hours.`);
}

module.exports = { initAlertEngine, runAlertCheck };
