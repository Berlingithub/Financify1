const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const Wallet = require('../Models/Wallet');
const { validateRecurringInput, REPEAT_DURATIONS } = require('../utils/recurringValidation');
const { parsePageLimit } = require('../utils/pagination');

router.get('/', async (req, res) => {
    try {
        const { _id } = req.user;
        const { page, limit, skip } = parsePageLimit(req.query, { defaultLimit: 20, maxLimit: 100 });
        
        const userData = await User.findById(_id).populate('wallet');
        if (!userData?.wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        const allPayments = userData.wallet.recurringPayments || [];
        
        // Paginate recurring payments
        const paginatedPayments = allPayments.slice(skip, skip + limit);
        
        res.json({
            recurringPayments: paginatedPayments,
            currentPage: page,
            totalPages: Math.ceil(allPayments.length / limit),
            totalPayments: allPayments.length,
            hasMore: skip + limit < allPayments.length
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
})

router.post('/', async (req, res) => {
    try {
        const validation = validateRecurringInput(req.body);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.errors.join(', ') });
        }

        const { _id } = req.user;
        const userData = await User.findById(_id).populate('wallet');
        if (!userData?.wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const userWallet = await Wallet.findById(userData.wallet._id);
        userWallet.recurringPayments.push(validation.data);
        await userWallet.save();

        res.status(201).json({
            message: 'Subscription added successfully',
            recurringPayments: userWallet.recurringPayments,
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// delete
router.delete('/', async (req, res) => {

    try {
        const { rpayment_id } = req.body;
        const { _id } = req.user;
        
        if (!rpayment_id) {
            return res.status(400).json({ message: "Recurring Payment ID is required" });
        }

        const userData = await User.findById(_id).populate('wallet')
        if (!userData || !userData.wallet) {
             return res.status(400).json({ message: "User wallet not found" });
        }

        // const userWallet = await Wallet.findById(userData.wallet._id);
        const newWalletdata = await Wallet.findByIdAndUpdate(userData.wallet._id, { $pull: { recurringPayments: { _id: rpayment_id } } }, {new: true});
        
        if (!newWalletdata) {
           return res.status(400).json({ message: "Wallet not found" })
        }
        res.status(200).json({ "message": "successfully deleted" })
        
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

// modify
router.put('/', async (req, res) => {
  try {
    const { rpayment_id, name, amount, date, repeatDuration } = req.body;
    const { _id } = req.user;
    
    if (!rpayment_id) {
      return res.status(400).json({ message: "Recurring payment ID is required" });
    }

    const userData = await User.findById(_id).populate('wallet');
    if (!userData || !userData.wallet) {
      return res.status(404).json({ message: "User wallet not found" });
    }

    const userWallet = await Wallet.findById(userData.wallet._id);
    const paymentToUpdate = userWallet.recurringPayments.id(rpayment_id);

    if (!paymentToUpdate) {
      return res.status(404).json({ message: "Recurring payment not found" });
    }

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: 'Subscription name cannot be empty' });
      }
      paymentToUpdate.name = String(name).trim();
    }
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      paymentToUpdate.amount = parsedAmount;
    }
    if (date !== undefined) {
      if (Number.isNaN(new Date(date).getTime())) {
        return res.status(400).json({ message: 'Invalid payment date' });
      }
      paymentToUpdate.date = new Date(date);
    }
    if (repeatDuration !== undefined) {
      if (!REPEAT_DURATIONS.includes(repeatDuration)) {
        return res.status(400).json({ message: 'Repeat duration must be Monthly or Annually' });
      }
      paymentToUpdate.repeatDuration = repeatDuration;
    }

    await userWallet.save();
    res.status(200).json({ message: "Recurring payment updated successfully", wallet: userWallet });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


module.exports = router;