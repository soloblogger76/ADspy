function categorizeAd(ad) {
  const text = (
    (ad.ad_creative_body || '') +
    ' ' +
    (ad.page_name || '') +
    ' ' +
    (ad.ad_creative_link_title || '')
  ).toLowerCase();

  const niche = detectNiche(text);
  const domain = extractDomain(ad);
  const funnelType = detectFunnelType(text);
  const platformType = detectPlatformType(ad.publisher_platforms);
  const adFormat = detectAdFormat(ad);
  const daysRunning = calculateDaysRunning(ad.ad_delivery_start_time);
  const ageCategory = getAgeCategory(daysRunning);

  return {
    ...ad,
    niche,
    domain,
    funnel_type: funnelType,
    platform_type: platformType,
    ad_format: adFormat,
    days_running: daysRunning,
    age_category: ageCategory
  };
}

function detectNiche(text) {
  const nichePatterns = [
    { name: 'Education', pattern: /course|learn|coaching|mentor|skill|training|certification|webinar/ },
    { name: 'E-commerce', pattern: /shop|buy|order|discount|sale|store|product|deal|offer/ },
    { name: 'Finance', pattern: /invest|crypto|loan|insurance|trading|stock|money|wealth|returns/ },
    { name: 'Health', pattern: /fitness|gym|diet|weight|wellness|supplement|health|yoga|nutrition/ },
    { name: 'Real Estate', pattern: /property|real estate|home|apartment|flat|rent|plot|villa|sqft/ },
    { name: 'SaaS/Tech', pattern: /software|app|saas|platform|cloud|tech|api|tool|dashboard|automate/ },
    { name: 'Fashion', pattern: /fashion|clothing|wear|dress|style|outfit|accessories|wardrobe/ },
    { name: 'Food', pattern: /food|restaurant|eat|recipe|delivery|cuisine|chef|meal|calories/ },
    { name: 'Travel', pattern: /travel|tour|holiday|trip|vacation|hotel|flight|visa|passport/ },
    { name: 'Beauty', pattern: /beauty|skin|makeup|cosmetic|hair|skincare|glow|serum|moisturizer/ },
    { name: 'Automotive', pattern: /car|auto|vehicle|bike|motor|drive|wheels|suv|engine/ }
  ];

  for (const { name, pattern } of nichePatterns) {
    if (pattern.test(text)) {
      return name;
    }
  }
  return 'Other';
}

function detectFunnelType(text) {
  const funnelPatterns = [
    { name: 'VSL', pattern: /watch this video|watch now|see how|video reveals|watch the video/ },
    { name: 'Webinar', pattern: /free webinar|register now|live training|join live|reserve your seat/ },
    { name: 'Lead Gen', pattern: /free guide|download now|get the ebook|free checklist|free report/ },
    { name: 'Product', pattern: /shop now|buy now|add to cart|order today|limited stock/ },
    { name: 'Booking', pattern: /book a call|schedule a call|free consultation|book now|apply now/ },
    { name: 'App', pattern: /download app|get the app|playstore|app store|install free/ },
    { name: 'Community', pattern: /join our group|free community|join now|become a member/ }
  ];

  for (const { name, pattern } of funnelPatterns) {
    if (pattern.test(text)) {
      return name;
    }
  }
  return 'Other';
}

function detectPlatformType(platforms) {
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return 'Facebook';
  }

  const hasFacebook = platforms.includes('facebook');
  const hasInstagram = platforms.includes('instagram');
  const hasAudienceNetwork = platforms.includes('audience_network');

  let result = '';
  if (hasFacebook && hasInstagram) {
    result = 'Facebook + Instagram';
  } else if (hasFacebook) {
    result = 'Facebook';
  } else if (hasInstagram) {
    result = 'Instagram';
  } else {
    result = 'Facebook';
  }

  if (hasAudienceNetwork) {
    result += ' + Audience Network';
  }

  return result;
}

function detectAdFormat(ad) {
  const platforms = ad.publisher_platforms || [];
  const snapshotUrl = (ad.ad_snapshot_url || '').toLowerCase();
  const body = ad.ad_creative_body || '';

  if (platforms.includes('video') || snapshotUrl.includes('/video/')) {
    return 'Video';
  }
  if (snapshotUrl.includes('stories')) {
    return 'Stories';
  }
  if (snapshotUrl.includes('reel')) {
    return 'Reels';
  }
  if (body.length > 300 || (body.match(/•/g) || []).length >= 2) {
    return 'Carousel';
  }
  return 'Image';
}

function calculateDaysRunning(deliveryStartTime) {
  if (!deliveryStartTime) return 0;
  const start = new Date(deliveryStartTime);
  const now = new Date();
  const diffMs = now - start;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getAgeCategory(daysRunning) {
  if (daysRunning <= 7) return 'new';
  if (daysRunning <= 30) return 'recent';
  return 'old';
}

function extractDomain(ad) {
  const source = ad.ad_creative_link_caption || ad.ad_creative_link_title || '';
  if (!source) return '';

  let domain = source
    .replace(/https?:\/\//gi, '')
    .replace(/^www\./i, '');

  const slashIndex = domain.indexOf('/');
  if (slashIndex !== -1) {
    domain = domain.substring(0, slashIndex);
  }

  if (domain.includes('.') && !domain.includes(' ')) {
    return domain.toLowerCase();
  }
  return '';
}

module.exports = { categorizeAd };
