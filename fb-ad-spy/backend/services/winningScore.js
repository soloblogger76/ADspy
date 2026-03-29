function calculateScore(ad) {
  let score = 0;

  const days = ad.days_running || 0;
  if (days < 3) {
    score += 5;
  } else if (days <= 7) {
    score += 15;
  } else if (days <= 30) {
    score += 35;
  } else if (days <= 60) {
    score += 55;
  } else if (days <= 90) {
    score += 70;
  } else {
    score += 85;
  }

  const countries = ad.ad_reached_countries;
  const countriesCount = Array.isArray(countries) ? countries.length : 0;
  if (countriesCount === 1) {
    score += 5;
  } else if (countriesCount >= 2 && countriesCount <= 3) {
    score += 10;
  } else if (countriesCount >= 4) {
    score += 15;
  }

  const platforms = ad.publisher_platforms;
  const platformsCount = Array.isArray(platforms) ? platforms.length : 0;
  if (platformsCount === 1) {
    score += 2;
  } else if (platformsCount >= 2) {
    score += 5;
  }

  if (ad.domain) {
    score += 5;
  }

  if (ad.ad_creative_body) {
    score += 5;
  }

  score = Math.min(score, 100);

  let winning_label;
  if (score >= 80) {
    winning_label = '\u{1F3C6} Battle-Tested Winner';
  } else if (score >= 60) {
    winning_label = '\u{1F525} Strong Performer';
  } else if (score >= 40) {
    winning_label = '\u{1F4C8} Growing';
  } else if (score >= 20) {
    winning_label = '\u{1F331} Early Stage';
  } else {
    winning_label = '\u{1F195} Brand New';
  }

  return { winning_score: score, winning_label };
}

module.exports = { calculateScore };
