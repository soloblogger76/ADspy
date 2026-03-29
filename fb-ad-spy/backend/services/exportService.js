const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

function exportToPDF(ads, title, teamName) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(28).fillColor('#3b82f6').text(title || 'Ad Spy Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#94a3b8').text(`Team: ${teamName || 'N/A'}`, { align: 'center' });
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.fontSize(12).text(`Total Ads: ${ads.length}`, { align: 'center' });
      doc.moveDown(2);

      let pageNum = 1;

      for (let i = 0; i < ads.length; i++) {
        const ad = ads[i];

        if (i > 0) {
          doc.addPage();
          pageNum++;
        }

        doc.fontSize(16).fillColor('#f1f5f9').text(`${ad.page_name || 'Unknown Page'}`, { underline: true });
        doc.moveDown(0.3);

        const details = [
          ['Score', `${ad.winning_score || 0} - ${ad.winning_label || 'N/A'}`],
          ['Niche', ad.niche || 'N/A'],
          ['Funnel', ad.funnel_type || 'N/A'],
          ['Platform', ad.platform_type || 'N/A'],
          ['Format', ad.ad_format || 'N/A'],
          ['Days Running', String(ad.days_running || 0)],
          ['Age', ad.age_category || 'N/A'],
          ['Countries', Array.isArray(ad.ad_reached_countries) ? ad.ad_reached_countries.join(', ') : (ad.ad_reached_countries || 'N/A')]
        ];

        for (const [label, value] of details) {
          doc.fontSize(10).fillColor('#94a3b8').text(`${label}: `, { continued: true });
          doc.fillColor('#f1f5f9').text(value);
        }

        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#94a3b8').text('Ad Text:');
        doc.fontSize(10).fillColor('#cbd5e1').text(ad.ad_creative_body || 'No ad text available', {
          width: 500,
          lineGap: 2
        });

        doc.moveDown(0.5);
        const revenueMin = ad.est_revenue_min ? `$${Math.round(ad.est_revenue_min).toLocaleString()}` : 'N/A';
        const revenueMax = ad.est_revenue_max ? `$${Math.round(ad.est_revenue_max).toLocaleString()}` : 'N/A';
        doc.fontSize(10).fillColor('#22c55e').text(`Est. Revenue: ${revenueMin} - ${revenueMax}`);
        doc.fontSize(10).fillColor('#94a3b8').text(`Confidence: ${ad.confidence || 'N/A'}`);

        doc.moveDown(0.3);
        const fbAdId = ad.fb_ad_id || '';
        const fbUrl = `https://www.facebook.com/ads/library/?id=${fbAdId}`;
        doc.fontSize(9).fillColor('#3b82f6').text(fbUrl, { link: fbUrl });

        doc.fontSize(8).fillColor('#64748b').text(`Page ${pageNum}`, 50, doc.page.height - 30, { align: 'center' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function exportToCSV(ads) {
  const fields = [
    'page_name', 'niche', 'funnel_type', 'platform_type', 'ad_format',
    'days_running', 'age_category', 'countries', 'winning_score', 'winning_label',
    'est_revenue_min', 'est_revenue_max', 'confidence', 'ad_creative_body',
    'ad_creative_link_title', 'domain', 'fb_library_url', 'cached_at'
  ];

  const data = ads.map(ad => ({
    page_name: ad.page_name || '',
    niche: ad.niche || '',
    funnel_type: ad.funnel_type || '',
    platform_type: ad.platform_type || '',
    ad_format: ad.ad_format || '',
    days_running: ad.days_running || 0,
    age_category: ad.age_category || '',
    countries: Array.isArray(ad.ad_reached_countries) ? ad.ad_reached_countries.join(', ') : (ad.ad_reached_countries || ''),
    winning_score: ad.winning_score || 0,
    winning_label: ad.winning_label || '',
    est_revenue_min: ad.est_revenue_min || 0,
    est_revenue_max: ad.est_revenue_max || 0,
    confidence: ad.confidence || '',
    ad_creative_body: ad.ad_creative_body || '',
    ad_creative_link_title: ad.ad_creative_link_title || '',
    domain: ad.domain || '',
    fb_library_url: `https://www.facebook.com/ads/library/?id=${ad.fb_ad_id || ''}`,
    cached_at: ad.cached_at || ad.saved_at || ''
  }));

  const parser = new Parser({ fields });
  return parser.parse(data);
}

module.exports = { exportToPDF, exportToCSV };
