const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({

    amountSpent:{
        type:Number,
        default:0
    },

    monthlyIncome:{
        amount:{
            type:Number,
            default:0
        },
        salaryDate:{
            type:Date,
            default:Date.now
        }
    },

    recurringPayments:[{
        name:{
            type:String,
            required:true,
        },
        amount:{
            type:Number,
            required:true,
        },
        repeatDuration:{
            type:String,
            enum:["Monthly","Annually","Annully"]
        },
        date:{
            type:Date,
            required:true
        }
    }],

    transactions:[{
        name:{
            type:String,
            required:true
        },
        category:{
            type:String,
            enum:["Household","Electronics","Others","Fashion","Sports and Fitness","Automobile","Baby Care"]
        },
        amount:{
            type:Number,
            required:true,
        },
        date:{
            type:Date,
            default:Date.now
        },
        paymentMode:{
            type:String,
            enum:["credit card","debit card","cash","bitcoin","net banking","UPI","digital wallets","others"]
        }
    }]
})

// Indexes for better query performance on nested arrays
walletSchema.index({ "transactions.date": 1 });  // For date-based transaction queries
walletSchema.index({ "recurringPayments.date": 1 });  // For recurring payment queries

const Wallet = new mongoose.model("Wallet",walletSchema);
module.exports= Wallet;