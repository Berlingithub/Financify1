const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateTransactionInput } = require('../utils/transactionValidation');
const { validateRecurringInput } = require('../utils/recurringValidation');
const { validatePassword } = require('../utils/passwordValidation');

test('transaction validation rejects invalid category', () => {
  const result = validateTransactionInput({
    name: 'Coffee',
    amount: 50,
    category: 'Invalid',
    paymentMode: 'cash',
  });
  assert.equal(result.valid, false);
});

test('transaction validation accepts valid payload', () => {
  const result = validateTransactionInput({
    name: 'Coffee',
    amount: 50,
    category: 'Others',
    paymentMode: 'cash',
  });
  assert.equal(result.valid, true);
  assert.equal(result.data.amount, 50);
});

test('recurring validation requires positive amount', () => {
  const result = validateRecurringInput({
    name: 'Netflix',
    amount: 0,
    repeatDuration: 'Monthly',
    date: '2026-01-01',
  });
  assert.equal(result.valid, false);
});

test('password validation enforces minimum length', () => {
  assert.equal(validatePassword('short').valid, false);
  assert.equal(validatePassword('longenough').valid, true);
});
