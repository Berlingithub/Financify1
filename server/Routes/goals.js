const express = require('express');
const router = express.Router();
const Goal = require('../Models/Goals')
const User = require('../Models/User')
const validator = require('validator');

router.get('/', async (req, res) => {
    try {
        const { _id } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Default 20 goals per page
        const skip = (page - 1) * limit;
        
        const userData = await User.findById(_id).populate('goals');
        const allGoals = userData.goals;
        
        // Paginate goals
        const paginatedGoals = allGoals.slice(skip, skip + limit);
        
        res.status(200).json({
            goals: paginatedGoals,
            currentPage: page,
            totalPages: Math.ceil(allGoals.length / limit),
            totalGoals: allGoals.length,
            hasMore: skip + limit < allGoals.length
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
})

// create
router.post('/', async (req, res) => {
    try {
        const { goal, targetAmount, currentAmount, endDate, completed } = req.body;
        
        // Input validation
        if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
            return res.status(400).json({ message: "Goal name is required" });
        }

        if (!targetAmount || typeof targetAmount !== 'number' || targetAmount <= 0) {
            return res.status(400).json({ message: "Target amount must be a positive number" });
        }
        
        if (currentAmount && (typeof currentAmount !== 'number' || currentAmount < 0)) {
            return res.status(400).json({ message: "Current amount must be a non-negative number" });
        }
        
        const newGoal = new Goal({ 
            goal: goal.trim(), 
            targetAmount, 
            currentAmount: currentAmount || 0, 
            endDate, 
            completed: completed || false 
        });
        
        const { _id } = req.user;
        const userData = await User.findById(_id);
        userData.goals.push(newGoal);
        await newGoal.save();
        await userData.save();
        
        res.status(201).json(newGoal);  // Changed from res.send() to res.json()
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
})

// delete
router.delete('/', async (req, res) => {

    try {
        const { _id } = req.user;
        const { goals_id } = req.body;
        await User.findByIdAndUpdate(_id, { $pull: { goals: goals_id } });
        await Goal.findByIdAndDelete(goals_id);
        res.status(200).json({ "message": "successfully deleted" })

    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

// update
router.put('/', async (req, res) => {
    try {
        const { goals_id } = req.body;
        const { goal, targetAmount, currentAmount, endDate, completed } = req.body;
        const updateGoals = await Goal.findByIdAndUpdate(goals_id, { goal, targetAmount, currentAmount, endDate, completed });
        await updateGoals.save();

        res.status(200).json({ "message": "successfully updated" })

    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

router.put('/addamount', async (req, res) => {
    try {
        const { goals_id,amountToBeAdded } = req.body;
        const updateGoals = await Goal.findById(goals_id);
        updateGoals.currentAmount+=amountToBeAdded;

        if(updateGoals.currentAmount>=updateGoals.targetAmount){
            updateGoals.currentAmount=updateGoals.targetAmount;
            updateGoals.completed=true;
        }
        await updateGoals.save();

        res.status(200).json({ "message": "successfully updated" })

    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

router.put('/completed', async (req, res) => {
    try {
        const { goals_id} = req.body;
        const updateGoals = await Goal.findById(goals_id);
        updateGoals.completed=true;
        updateGoals.currentAmount=updateGoals.targetAmount;
        await updateGoals.save();
        res.status(200).json({ "message": "successfully updated" })

    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})


module.exports = router;