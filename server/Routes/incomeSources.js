const express = require('express');
const User = require('../Models/User');
const Wallet = require('../Models/Wallet');
const router = express.Router();

router.get('/',async(req,res)=>{

    try{
        const {_id} = req.user;
        const userData = await User.findById(_id).populate('wallet')
        res.json(userData.wallet.monthlyIncome)
    }
    catch(e){
        res.status(400).json({ message: e.message })
    }

})

// update
router.post('/',async(req,res)=>{

    const {amount,salaryDate}=req.body;
    const {_id}=req.user;
    const newIncome={amount,salaryDate};

    const userData = await User.findById(_id)
    const userWallet = await Wallet.findByIdAndUpdate({_id:userData.wallet});
    userWallet.monthlyIncome=newIncome;
    await userWallet.save();
    res.json({"message":"Successfully Added Income Source"})
    
})

// delete
router.delete('/', async (req, res) => {
  try {
    const { _id } = req.user;
    
    const userData = await User.findById(_id).populate('wallet');
    if (!userData || !userData.wallet) {
      return res.status(404).json({ message: "User wallet not found" });
    }

    const userWallet = await Wallet.findById(userData.wallet._id);
    
    // Simply set monthlyIncome to default values instead of deleting
    userWallet.monthlyIncome = {
      amount: 0,
      salaryDate: new Date()
    };
    
    await userWallet.save();
    res.status(200).json({ message: "Income source removed successfully", wallet: userWallet });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// modify (updates the existing income entries)
// router.put('/',async(req,res)=>{
//     try {
//        const {income_id, wallet_id, amount, salaryDate} = req.body;
//        const userWallet = await Wallet.findById(wallet_id);
//        const incomeToUpdate = userWallet.monthlyIncome.id(income_id);

//        if (!incomeToUpdate) {
//             return res.status(404).json({ message: "Income entry not found" });
//        }
//        // Update fields
//        if (amount !== undefined) incomeToUpdate.amount = amount;
//        if (salaryDate !== undefined) incomeToUpdate.salaryDate = salaryDate;

//        await userWallet.save();
//        res.status(200).json({message: "Income source updated successfully"});
//      } 
//      catch (e) {

//      }
// })


module.exports = router;