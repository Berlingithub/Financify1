const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const Wallet = require('../Models/Wallet');
const {
  validateTransactionInput,
  CATEGORIES,
  PAYMENT_MODES,
} = require('../utils/transactionValidation');
const { parsePageLimit } = require('../utils/pagination');

router.get('/', async (req, res) => {
  try {
    const { _id } = req.user;
    const { page, limit, skip } = parsePageLimit(req.query, { defaultLimit: 50, maxLimit: 100 });

    const userData = await User.findById(_id).populate('wallet');
    if (!userData?.wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const allTransactions = userData.wallet.transactions;

    const paginatedTransactions = [...allTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + limit);

    res.status(200).json({
      transactions: paginatedTransactions,
      currentPage: page,
      totalPages: Math.ceil(allTransactions.length / limit) || 1,
      totalTransactions: allTransactions.length,
      hasMore: skip + limit < allTransactions.length,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const validation = validateTransactionInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }

    const { _id } = req.user;
    const userData = await User.findById(_id).populate('wallet');
    if (!userData?.wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const userWallet = await Wallet.findById(userData.wallet._id);
    userWallet.transactions.push(validation.data);
    await userWallet.save();

    res.status(201).json({
      message: 'Transaction created successfully',
      wallet: userWallet,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { transaction_id } = req.body;
    const { _id } = req.user;

    if (!transaction_id) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const userData = await User.findById(_id).populate('wallet');
    if (!userData?.wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const userWallet = await Wallet.findById(userData.wallet._id);
    const transaction = userWallet.transactions.id(transaction_id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.deleteOne();
    await userWallet.save();

    res.status(200).json({ message: 'successfully deleted' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { name, category, amount, date, paymentMode, transaction_id } = req.body;
    const { _id } = req.user;

    if (!transaction_id) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const userData = await User.findById(_id).populate('wallet');
    if (!userData?.wallet) {
      return res.status(404).json({ message: 'User wallet not found' });
    }

    const userWallet = await Wallet.findById(userData.wallet._id);
    const transactionToUpdate = userWallet.transactions.id(transaction_id);

    if (!transactionToUpdate) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Transaction name cannot be empty' });
      }
      transactionToUpdate.name = name.trim();
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      transactionToUpdate.amount = parsedAmount;
    }
    if (category !== undefined) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ message: 'Valid category is required' });
      }
      transactionToUpdate.category = category;
    }
    if (date !== undefined && date !== null && date !== '') {
      if (Number.isNaN(new Date(date).getTime())) {
        return res.status(400).json({ message: 'Invalid date' });
      }
      transactionToUpdate.date = new Date(date);
    }
    if (paymentMode !== undefined) {
      if (!PAYMENT_MODES.includes(paymentMode)) {
        return res.status(400).json({ message: 'Valid payment mode is required' });
      }
      transactionToUpdate.paymentMode = paymentMode;
    }

    await userWallet.save();
    res.status(200).json({ message: 'Transaction updated successfully', wallet: userWallet });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
