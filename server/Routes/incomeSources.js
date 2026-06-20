const express = require('express');
const User = require('../Models/User');
const Wallet = require('../Models/Wallet');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { _id } = req.user;
    const userData = await User.findById(_id).populate('wallet');
    if (!userData?.wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    res.json(userData.wallet.monthlyIncome);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { amount, salaryDate } = req.body;
    const { _id } = req.user;

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number' });
    }

    if (salaryDate && Number.isNaN(new Date(salaryDate).getTime())) {
      return res.status(400).json({ message: 'Invalid salary date' });
    }

    const userData = await User.findById(_id);
    if (!userData?.wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const userWallet = await Wallet.findById(userData.wallet);
    if (!userWallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    userWallet.monthlyIncome = {
      amount: parsedAmount,
      salaryDate: salaryDate ? new Date(salaryDate) : new Date(),
    };
    await userWallet.save();

    res.json({
      message: 'Successfully updated income source',
      monthlyIncome: userWallet.monthlyIncome,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { _id } = req.user;

    const userData = await User.findById(_id).populate('wallet');
    if (!userData?.wallet) {
      return res.status(404).json({ message: 'User wallet not found' });
    }

    const userWallet = await Wallet.findById(userData.wallet._id);

    userWallet.monthlyIncome = {
      amount: 0,
      salaryDate: new Date(),
    };

    await userWallet.save();
    res.status(200).json({
      message: 'Income source removed successfully',
      monthlyIncome: userWallet.monthlyIncome,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
