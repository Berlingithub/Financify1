const CATEGORIES = [
  'Household',
  'Electronics',
  'Others',
  'Fashion',
  'Sports and Fitness',
  'Automobile',
  'Baby Care',
];

const PAYMENT_MODES = [
  'credit card',
  'debit card',
  'cash',
  'bitcoin',
  'net banking',
  'UPI',
  'digital wallets',
  'others',
];

function validateTransactionInput(body) {
  const { name, category, amount, date, paymentMode } = body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Transaction name is required');
  }

  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!category || !CATEGORIES.includes(category)) {
    errors.push('Valid category is required');
  }

  if (!paymentMode || !PAYMENT_MODES.includes(paymentMode)) {
    errors.push('Valid payment mode is required');
  }

  if (date !== undefined && date !== null && date !== '' && Number.isNaN(new Date(date).getTime())) {
    errors.push('Invalid date');
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      name: name.trim(),
      category,
      amount: parsedAmount,
      date: date ? new Date(date) : new Date(),
      paymentMode,
    },
  };
}

module.exports = {
  CATEGORIES,
  PAYMENT_MODES,
  validateTransactionInput,
};
