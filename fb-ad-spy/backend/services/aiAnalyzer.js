const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/db');

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function parseJsonResponse(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  return JSON.parse(cleaned);
}

async function analyzeAd(ad, teamId) {
  const existing = db.prepare(
    'SELECT analysis_json FROM ai_analyses WHERE fb_ad_id = ? AND team_id = ? AND analysis_json IS NOT NULL ORDER BY created_at DESC LIMIT 1'
  ).get(ad.fb_ad_id, teamId);

  if (existing && existing.analysis_json) {
    return JSON.parse(existing.analysis_json);
  }

  const client = getClient();

  const message = await client.messages.create({
    model: 'claude-opus-4-5-20250219',
    max_tokens: 2048,
    system: 'You are an expert direct-response advertising analyst.\nReturn ONLY valid JSON. No explanation. No markdown.',
    messages: [
      {
        role: 'user',
        content: `Analyze this Facebook ad:
Page: ${ad.page_name || 'Unknown'}
Body: ${ad.ad_creative_body || 'No body text'}
Title: ${ad.ad_creative_link_title || 'No title'}
Niche: ${ad.niche || 'Unknown'}
Days Running: ${ad.days_running || 0}
Countries: ${JSON.stringify(ad.ad_reached_countries || [])}
Winning Score: ${ad.winning_score || 0}
Return this exact JSON structure:
{
  "hook_type": "string",
  "hook_strength": 0,
  "tone": "string",
  "target_audience": "string",
  "core_offer": "string",
  "pain_points_addressed": [],
  "psychological_triggers": [],
  "cta_effectiveness": 0,
  "why_it_works": "string",
  "weaknesses": [],
  "improvement_suggestions": [],
  "overall_score": 0
}`
      }
    ]
  });

  const responseText = message.content[0].text;
  const analysis = parseJsonResponse(responseText);

  db.prepare(
    'INSERT INTO ai_analyses (team_id, fb_ad_id, analysis_json) VALUES (?, ?, ?)'
  ).run(teamId, ad.fb_ad_id, JSON.stringify(analysis));

  return analysis;
}

async function generateAdCopy(ad, userProduct, teamId) {
  const existingAnalysis = db.prepare(
    'SELECT analysis_json FROM ai_analyses WHERE fb_ad_id = ? AND team_id = ? AND analysis_json IS NOT NULL ORDER BY created_at DESC LIMIT 1'
  ).get(ad.fb_ad_id, teamId);

  let analysis = {};
  if (existingAnalysis && existingAnalysis.analysis_json) {
    analysis = JSON.parse(existingAnalysis.analysis_json);
  }

  const client = getClient();

  const message = await client.messages.create({
    model: 'claude-opus-4-5-20250219',
    max_tokens: 3000,
    system: 'You are an expert Facebook ad copywriter.\nReturn ONLY valid JSON. No explanation. No markdown.',
    messages: [
      {
        role: 'user',
        content: `Study this winning ad and write 3 new variations for a different product using the same proven structure.

Winning Ad:
Body: ${ad.ad_creative_body || 'No body text'}
Hook Type: ${analysis.hook_type || 'Unknown'}
Why It Works: ${analysis.why_it_works || 'Unknown'}

New Product: ${userProduct}

Return:
{
  "variations": [
    {
      "headline": "string",
      "primary_text": "string",
      "description": "string",
      "cta": "string",
      "hook_used": "string",
      "target_audience": "string",
      "estimated_effectiveness": 0
    }
  ]
}`
      }
    ]
  });

  const responseText = message.content[0].text;
  const result = parseJsonResponse(responseText);

  db.prepare(
    'INSERT INTO ai_analyses (team_id, fb_ad_id, generated_copy_json) VALUES (?, ?, ?)'
  ).run(teamId, ad.fb_ad_id, JSON.stringify(result));

  return result;
}

module.exports = { analyzeAd, generateAdCopy };
