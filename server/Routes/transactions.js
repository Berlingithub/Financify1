const express = require('express');
const { isLoggedIn } = require('../middlewares');
const router = express.Router();
const User = require('../Models/User')
const Wallet = require('../Models/Wallet')

// read with pagination
router.get('/', async (req, res) => {
    try {
        const { _id } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; // Default 50 transactions per page
        const skip = (page - 1) * limit;
        
        const userData = await User.findById(_id).populate('wallet');
        const allTransactions = userData.wallet.transactions;
        
        // Sort by date (newest first) and paginate
        const paginatedTransactions = allTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(skip, skip + limit);
        
        res.status(200).json({
            transactions: paginatedTransactions,
            currentPage: page,
            totalPages: Math.ceil(allTransactions.length / limit),
            totalTransactions: allTransactions.length,
            hasMore: skip + limit < allTransactions.length
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
})

// add
router.post('/', async (req, res) => {

    const { name, category, amount, date, paymentMode } = req.body;
    const newTransaction = { name, category, amount, date, paymentMode };
    const { _id } = req.user;
    const userData = await User.findById(_id).populate('wallet')
    const userWallet = await Wallet.findById(userData.wallet._id);
    userWallet.transactions.push(newTransaction)
    userWallet.amountSpent += parseInt(amount)
    await userWallet.save()
    res.json(await User.findById(_id).populate('wallet'))  // Changed from res.send() to res.json()

})

// delete
router.delete('/', async (req, res) => {

    try {

        const { transaction_id } = req.body;
        const { _id } = req.user;
        const userData = await User.findById(_id).populate('wallet');

        if (!userData || !userData.wallet) {
            return res.status(404).json({ message: "Wallet not found" })  
        }

        const userWallet = await Wallet.findById(userData.wallet._id);
        const transaction = userWallet.transactions.id(transaction_id); 

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" }); 
        }

        // Subtract the amount from total spent
        userWallet.amountSpent -= parseInt(transaction.amount);
        
        // Remove transaction from array using $pull operator
        await Wallet.findByIdAndUpdate(
            userData.wallet._id,
            { $pull: { transactions: { _id: transaction_id } } }
        );
        
        // Save the wallet to update amountSpent
        await userWallet.save();
        
        res.status(200).json({ "message": "successfully deleted" })
    } catch (e) {
        res.status(400).json({ "error": e.message })
    }
})

// modify
router.put('/', async (req, res) => {
  try {
    const { name, category, amount, date, paymentMode, transaction_id } = req.body;
    const { _id } = req.user;

    if (!transaction_id) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    const userData = await User.findById(_id).populate('wallet');
    if (!userData || !userData.wallet) {
      return res.status(404).json({ message: "User wallet not found" });
    }

    const userWallet = await Wallet.findById(userData.wallet._id);
    const transactionToUpdate = userWallet.transactions.id(transaction_id);

    if (!transactionToUpdate) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Calculate amount difference if amount changed
    const oldAmount = transactionToUpdate.amount;
    
    // Update fields if provided
    if (name !== undefined) transactionToUpdate.name = name;
    if (category !== undefined) transactionToUpdate.category = category;
    if (amount !== undefined) {
      transactionToUpdate.amount = amount;
      // Update total spent
      userWallet.amountSpent = userWallet.amountSpent - oldAmount + parseInt(amount);
    }
    if (date !== undefined) transactionToUpdate.date = date;
    if (paymentMode !== undefined) transactionToUpdate.paymentMode = paymentMode;

    await userWallet.save();
    res.status(200).json({ message: "Transaction updated successfully", wallet: userWallet });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;