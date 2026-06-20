const { CATEGORIES, PAYMENT_MODES } = require('../utils/transactionValidation');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function normalizeCategory(category) {
  if (category && CATEGORIES.includes(category)) {
    return category;
  }
  const match = CATEGORIES.find(
    (c) => c.toLowerCase() === String(category || '').toLowerCase()
  );
  return match || 'Others';
}

function normalizePaymentMode(mode) {
  if (mode && PAYMENT_MODES.includes(mode)) {
    return mode;
  }
  const lower = String(mode || '').toLowerCase();
  const match = PAYMENT_MODES.find((m) => m.toLowerCase() === lower);
  return match || null;
}

function parseReceiptDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function normalizeReceiptParse(raw) {
  const amount = Number(raw.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    const err = new Error('Could not detect a valid total amount on this receipt');
    err.statusCode = 422;
    throw err;
  }

  const alternativeAmounts = (raw.alternativeAmounts || [])
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0 && n !== amount)
    .slice(0, 3);

  return {
    merchant: (raw.merchant || 'Receipt purchase').trim().slice(0, 120),
    amount: Math.round(amount * 100) / 100,
    date: parseReceiptDate(raw.date),
    category: normalizeCategory(raw.category),
    paymentMode: normalizePaymentMode(raw.paymentMode),
    confidence: ['high', 'medium', 'low'].includes(raw.confidence)
      ? raw.confidence
      : 'medium',
    lineItems: Array.isArray(raw.lineItems)
      ? raw.lineItems
          .filter((item) => item && item.description)
          .slice(0, 10)
          .map((item) => ({
            description: String(item.description).slice(0, 80),
            amount: Number(item.amount) || 0,
          }))
      : [],
    alternativeAmounts,
    source: 'openai-vision',
  };
}

function mapOpenAiError(status, errBody) {
  let openAiError;
  try {
    openAiError = JSON.parse(errBody)?.error;
  } catch {
    openAiError = null;
  }

  const code = openAiError?.code;
  const err = new Error('Failed to analyze receipt with AI. Please try again.');
  err.statusCode = 502;
  err.openAiCode = code;

  if (code === 'insufficient_quota') {
    err.message =
      'OpenAI quota exceeded. Add billing at platform.openai.com/account/billing, or the app will use OCR fallback.';
    err.statusCode = 402;
    err.fallbackRecommended = true;
  } else if (code === 'invalid_api_key') {
    err.message = 'Invalid OpenAI API key. Check OPENAI_API_KEY in your server .env file.';
    err.statusCode = 401;
  } else if (status === 429) {
    err.message = 'OpenAI rate limit reached. Please wait a moment and try again.';
    err.fallbackRecommended = true;
  } else if (status === 401) {
    err.message = 'OpenAI authentication failed. Verify your API key.';
    err.statusCode = 401;
  } else if (openAiError?.message) {
    err.message = openAiError.message;
  }

  return err;
}

function normalizeMimeType(mimeType) {
  if (!mimeType || mimeType === 'image/jpg') {
    return 'image/jpeg';
  }
  return mimeType;
}

async function parseReceiptImage(buffer, mimeType) {
  if (!OPENAI_API_KEY) {
    const err = new Error(
      'AI receipt parsing is not configured. Add OPENAI_API_KEY to your server environment.'
    );
    err.statusCode = 503;
    err.fallbackRecommended = true;
    throw err;
  }

  const base64 = buffer.toString('base64');
  const normalizedMime = normalizeMimeType(mimeType);
  const categoriesList = CATEGORIES.join(', ');
  const paymentModesList = PAYMENT_MODES.join(', ');

  const prompt = `You are a receipt parsing assistant for a personal finance app (India-focused, currency INR ₹).
Analyze this receipt image and extract structured purchase data.

Return ONLY valid JSON with this exact shape:
{
  "merchant": "store or merchant name",
  "amount": 123.45,
  "date": "YYYY-MM-DD or null if unreadable",
  "category": "one of: ${categoriesList}",
  "paymentMode": "one of: ${paymentModesList} or null if unknown",
  "confidence": "high|medium|low",
  "lineItems": [{"description": "item name", "amount": 10.00}],
  "alternativeAmounts": [other plausible total amounts if ambiguous]
}

Rules:
- "amount" must be the final total paid (grand total / net amount / amount due), NOT bill number, table number, or tax-only lines.
- Pick the best matching category from the allowed list only.
- Use ISO date format when possible.
- Infer UPI/card/cash from payment hints on the receipt when visible.`;

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${normalizedMime};base64,${base64}`,
                  detail: 'low',
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 900,
        temperature: 0.1,
      }),
    });
  } catch (networkErr) {
    const err = new Error('Could not reach OpenAI. Check your internet connection.');
    err.statusCode = 503;
    err.fallbackRecommended = true;
    throw err;
  }

  if (!response.ok) {
    const errBody = await response.text();
    console.error('OpenAI API error:', response.status, errBody.slice(0, 500));
    throw mapOpenAiError(response.status, errBody);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    const err = new Error('Empty response from AI receipt parser');
    err.statusCode = 502;
    err.fallbackRecommended = true;
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const err = new Error('AI returned invalid data. Please try again or enter manually.');
    err.statusCode = 502;
    err.fallbackRecommended = true;
    throw err;
  }

  return normalizeReceiptParse(parsed);
}

module.exports = { parseReceiptImage, normalizeReceiptParse };
