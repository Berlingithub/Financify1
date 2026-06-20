function getMonthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function getTransactionsThisMonth(transactions, date = new Date()) {
  const { start, end } = getMonthBounds(date);
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });
}

function getMonthlyAmountSpent(transactions, date = new Date()) {
  return getTransactionsThisMonth(transactions, date).reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );
}

function getCategoryBreakdown(transactions, date = new Date()) {
  const monthly = getTransactionsThisMonth(transactions, date);
  const totals = {};

  monthly.forEach((t) => {
    const category = t.category || 'Others';
    totals[category] = (totals[category] || 0) + Number(t.amount || 0);
  });

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, amount]) => sum + amount, 0);

  const labels = entries.map(([category]) => category);
  const series = entries.map(([, amount]) =>
    total > 0 ? Math.round((amount / total) * 100) : 0
  );

  return { labels, series, totals, total };
}

function getRecentTransactions(transactions, limit = 5) {
  return [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

module.exports = {
  getMonthBounds,
  getTransactionsThisMonth,
  getMonthlyAmountSpent,
  getCategoryBreakdown,
  getRecentTransactions,
};
