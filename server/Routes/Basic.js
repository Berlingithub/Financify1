const express = require('express');
const router = express.Router();


router.get('/',(req,res)=>{
    console.log(req.user)
    console.log("Server works")
    res.status(200).json({ message: "Server is running" })
})

module.exports = router;