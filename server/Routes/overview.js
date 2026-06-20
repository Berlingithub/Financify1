const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const {
  getMonthlyAmountSpent,
  getCategoryBreakdown,
  getRecentTransactions,
  getTransactionsThisMonth,
} = require('../utils/walletAnalytics');

router.get('/', async (req, res) => {
  try {
    const userData = await User.findById(req.user._id).populate('goals').populate('wallet');

    if (!userData?.wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const transactions = userData.wallet.transactions || [];
    const monthlyTransactions = getTransactionsThisMonth(transactions);
    const categoryBreakdown = getCategoryBreakdown(transactions);

    const data = {
      totalAmountSpent: getMonthlyAmountSpent(transactions),
      monthlyIncome: userData.wallet.monthlyIncome.amount,
      monthlyIncomeDate: userData.wallet.monthlyIncome.salaryDate,
      transactionsCount: monthlyTransactions.length,
      totalTransactionsAllTime: transactions.length,
      recurringCount: userData.wallet.recurringPayments.length,
      recentTransactions: getRecentTransactions(transactions, 5),
      categoryBreakdown,
      goals: userData.goals,
    };

    res.json(data);
  } catch (e) {
    console.error('Overview error:', e.message);
    res.status(500).json({ message: 'Error fetching overview data', error: e.message });
  }
});

module.exports = router;
