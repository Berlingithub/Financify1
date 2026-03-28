const express = require('express');
const router = express.Router();
const User = require('../Models/User')
const Wallet = require('../Models/Wallet')

router.get('/', async (req, res) => {
    try {
        const { _id } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Default 20 recurring payments per page
        const skip = (page - 1) * limit;
        
        const userData = await User.findById(_id).populate('wallet');
        const allPayments = userData.wallet.recurringPayments;
        
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

// add
router.post('/', async (req, res) => {

    const { name, amount, date, repeatDuration } = req.body;
    const newPayment = { name, amount, date, repeatDuration };
    const { _id } = req.user;
    const userData = await User.findById(_id).populate('wallet')
    const userWallet = await Wallet.findById(userData.wallet._id);
    userWallet.recurringPayments.push(newPayment);
    await userWallet.save()
    res.json(await User.findById(_id).populate('wallet'))  // Changed from res.send() to res.json()

})

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

    // Update fields if provided
    if (name !== undefined) paymentToUpdate.name = name;
    if (amount !== undefined) paymentToUpdate.amount = amount;
    if (date !== undefined) paymentToUpdate.date = date;
    if (repeatDuration !== undefined) paymentToUpdate.repeatDuration = repeatDuration;

    await userWallet.save();
    res.status(200).json({ message: "Recurring payment updated successfully", wallet: userWallet });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


module.exports = router;