const CPC_TABLE = {
  'Education':   { IN: 12,  US: 180, GB: 160, AU: 140, AE: 90,  default: 25 },
  'Finance':     { IN: 45,  US: 450, GB: 400, AU: 380, AE: 200, default: 90 },
  'E-commerce':  { IN: 8,   US: 120, GB: 110, AU: 100, AE: 60,  default: 20 },
  'Health':      { IN: 15,  US: 200, GB: 180, AU: 170, AE: 100, default: 35 },
  'Real Estate': { IN: 35,  US: 380, GB: 350, AU: 320, AE: 180, default: 75 },
  'SaaS/Tech':   { IN: 30,  US: 350, GB: 300, AU: 280, AE: 160, default: 65 },
  'Fashion':     { IN: 6,   US: 90,  GB: 85,  AU: 80,  AE: 45,  default: 15 },
  'Beauty':      { IN: 10,  US: 150, GB: 130, AU: 120, AE: 70,  default: 25 },
  'Travel':      { IN: 20,  US: 250, GB: 220, AU: 200, AE: 120, default: 45 },
  'Food':        { IN: 5,   US: 80,  GB: 70,  AU: 65,  AE: 40,  default: 12 },
  'Automotive':  { IN: 10,  US: 130, GB: 110, AU: 100, AE: 60,  default: 22 },
  'Other':       { IN: 10,  US: 130, GB: 110, AU: 100, AE: 60,  default: 22 }
};

const ROAS_TABLE = {
  'Finance': 8,
  'SaaS/Tech': 7,
  'Education': 5,
  'Health': 4,
  'Real Estate': 4,
  'E-commerce': 3,
  'Beauty': 3.5,
  'Fashion': 3,
  'Travel': 3,
  'Food': 3,
  'Automotive': 3,
  'Other': 3
};

function getCurrencySymbol(country) {
  if (country === 'IN') return '\u20B9';
  if (['US', 'AU', 'CA', 'SG'].includes(country)) return '$';
  if (country === 'GB') return '\u00A3';
  if (country === 'AE') return 'AED';
  return '$';
}

function formatNumber(n, country) {
  const symbol = getCurrencySymbol(country);
  if (country === 'IN') {
    if (n >= 10000000) {
      return symbol + (n / 10000000).toFixed(1) + 'Cr';
    }
    if (n >= 100000) {
      return symbol + (n / 100000).toFixed(1) + 'L';
    }
    return symbol + Math.round(n).toLocaleString('en-IN');
  }
  if (n >= 1000000) {
    return symbol + (n / 1000000).toFixed(1) + 'M';
  }
  if (n >= 1000) {
    return symbol + (n / 1000).toFixed(1) + 'K';
  }
  return symbol + Math.round(n).toString();
}

function estimateRevenue(ad) {
  const niche = ad.niche || 'Other';
  const countries = ad.ad_reached_countries;
  const primaryCountry = (Array.isArray(countries) && countries.length > 0) ? countries[0] : 'US';
  const daysRunning = ad.days_running || 1;

  const nicheRates = CPC_TABLE[niche] || CPC_TABLE['Other'];
  const cpc = nicheRates[primaryCountry] || nicheRates.default;
  const roas = ROAS_TABLE[niche] || ROAS_TABLE['Other'];

  const fbAdIdStr = String(ad.fb_ad_id || ad.id || '0');
  const dailyClicks = 50 + (parseInt(fbAdIdStr, 36) % 250);
  const dailySpend = dailyClicks * cpc;
  const totalSpend = dailySpend * daysRunning;

  const minSpend = totalSpend * 0.6;
  const maxSpend = totalSpend * 1.8;
  const minRevenue = minSpend * roas;
  const maxRevenue = maxSpend * roas;

  const estDailySpendMin = dailySpend * 0.6;
  const estDailySpendMax = dailySpend * 1.8;

  let confidence;
  if (daysRunning > 30) {
    confidence = 'High';
  } else if (daysRunning > 7) {
    confidence = 'Medium';
  } else {
    confidence = 'Low';
  }

  const currencySymbol = getCurrencySymbol(primaryCountry);

  return {
    est_daily_spend_min: estDailySpendMin,
    est_daily_spend_max: estDailySpendMax,
    est_total_spend_min: minSpend,
    est_total_spend_max: maxSpend,
    est_revenue_min: minRevenue,
    est_revenue_max: maxRevenue,
    currency_symbol: currencySymbol,
    confidence,
    formatted: {
      daily_spend: formatNumber(estDailySpendMin, primaryCountry) + ' \u2013 ' + formatNumber(estDailySpendMax, primaryCountry),
      total_spend: formatNumber(minSpend, primaryCountry) + ' \u2013 ' + formatNumber(maxSpend, primaryCountry),
      revenue: formatNumber(minRevenue, primaryCountry) + ' \u2013 ' + formatNumber(maxRevenue, primaryCountry)
    },
    disclaimer: 'Estimated using industry benchmarks. Not actual Facebook data.'
  };
}

module.exports = { estimateRevenue };
