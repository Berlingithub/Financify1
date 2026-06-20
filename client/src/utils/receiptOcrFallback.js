import Tesseract from 'tesseract.js';

function extractAmountsFromText(text) {
  const candidates = [];
  const lower = text.toLowerCase();

  const billMatch = text.match(
    /(?:bill\s+amount|grand\s+total|net\s+amount|total\s+amount|amount\s+due|balance\s+due|total)\s*[:\-\.]?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d{1,2})?)/i
  );
  if (billMatch?.[1]) {
    candidates.push(parseFloat(billMatch[1]));
  }

  const currencyMatches = text.matchAll(/(?:rs\.?|inr|₹)\s*(\d+(?:\.\d{1,2})?)/gi);
  for (const match of currencyMatches) {
    candidates.push(parseFloat(match[1]));
  }

  const allNumbers = [...text.matchAll(/\b(\d+(?:\.\d{1,2})?)\b/g)]
    .map((m) => parseFloat(m[1]))
    .filter((n) => n >= 10 && n < 100000);

  for (const n of allNumbers) {
    candidates.push(n);
  }

  const unique = [...new Set(candidates.filter((n) => !Number.isNaN(n) && n > 0))];
  unique.sort((a, b) => b - a);

  if (lower.includes('total') && unique.length > 1) {
    return unique;
  }

  return unique.slice(0, 3);
}

function guessMerchant(text) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && l.length < 60);

  for (const line of lines.slice(0, 8)) {
    if (/^\d+$/.test(line)) continue;
    if (/^(date|time|bill|invoice|gst|tax|total|amount|table|tel|phone)/i.test(line)) continue;
    return line.slice(0, 80);
  }

  return 'Receipt purchase';
}

export async function parseReceiptWithOcr(file, onProgress) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const text = result.data?.text || '';
    const amounts = extractAmountsFromText(text);
    const amount = amounts[0];

    if (!amount) {
      throw new Error('OCR could not detect an amount. Enter the transaction manually.');
    }

    return {
      merchant: guessMerchant(text),
      amount: Math.round(amount * 100) / 100,
      date: null,
      category: 'Others',
      paymentMode: null,
      confidence: 'low',
      lineItems: [],
      alternativeAmounts: amounts.slice(1),
      source: 'tesseract-ocr',
      rawText: text.slice(0, 500),
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
