const REPEAT_DURATIONS = ['Monthly', 'Annually'];

function validateRecurringInput(body) {
  const { name, amount, date, repeatDuration } = body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Subscription name is required');
  }

  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!repeatDuration || !REPEAT_DURATIONS.includes(repeatDuration)) {
    errors.push('Repeat duration must be Monthly or Annually');
  }

  if (date === undefined || date === null || date === '') {
    errors.push('Payment date is required');
  } else if (Number.isNaN(new Date(date).getTime())) {
    errors.push('Invalid payment date');
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      name: name.trim(),
      amount: parsedAmount,
      repeatDuration,
      date: new Date(date),
    },
  };
}

module.exports = { REPEAT_DURATIONS, validateRecurringInput };
