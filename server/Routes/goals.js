const express = require('express');
const router = express.Router();
const Goal = require('../Models/Goals');
const User = require('../Models/User');
const { assertGoalOwnership } = require('../utils/goalAuth');

router.get('/', async (req, res) => {
  try {
    const { _id } = req.user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const userData = await User.findById(_id).populate('goals');
    const allGoals = userData.goals || [];

    const paginatedGoals = allGoals.slice(skip, skip + limit);

    res.status(200).json({
      goals: paginatedGoals,
      currentPage: page,
      totalPages: Math.ceil(allGoals.length / limit) || 1,
      totalGoals: allGoals.length,
      hasMore: skip + limit < allGoals.length,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { goal, targetAmount, currentAmount, endDate, completed } = req.body;

    if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
      return res.status(400).json({ message: 'Goal name is required' });
    }

    if (!targetAmount || typeof targetAmount !== 'number' || targetAmount <= 0) {
      return res.status(400).json({ message: 'Target amount must be a positive number' });
    }

    if (currentAmount && (typeof currentAmount !== 'number' || currentAmount < 0)) {
      return res.status(400).json({ message: 'Current amount must be a non-negative number' });
    }

    const newGoal = new Goal({
      goal: goal.trim(),
      targetAmount,
      currentAmount: currentAmount || 0,
      endDate,
      completed: completed || false,
    });

    await newGoal.save();

    const { _id } = req.user;
    const userData = await User.findById(_id);
    userData.goals.push(newGoal._id);
    await userData.save();

    res.status(201).json(newGoal);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { _id } = req.user;
    const { goals_id } = req.body;

    if (!goals_id) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }

    if (!(await assertGoalOwnership(_id, goals_id, res))) return;

    await User.findByIdAndUpdate(_id, { $pull: { goals: goals_id } });
    await Goal.findByIdAndDelete(goals_id);
    res.status(200).json({ message: 'successfully deleted' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { _id } = req.user;
    const { goals_id, goal, targetAmount, currentAmount, endDate, completed } = req.body;

    if (!goals_id) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }

    if (!(await assertGoalOwnership(_id, goals_id, res))) return;

    const updateGoals = await Goal.findByIdAndUpdate(
      goals_id,
      { goal, targetAmount, currentAmount, endDate, completed },
      { new: true, runValidators: true }
    );

    if (!updateGoals) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(200).json({ message: 'successfully updated', goal: updateGoals });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/addamount', async (req, res) => {
  try {
    const { _id } = req.user;
    const { goals_id, amountToBeAdded } = req.body;

    if (!goals_id) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }

    const parsedAmount = Number(amountToBeAdded);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    if (!(await assertGoalOwnership(_id, goals_id, res))) return;

    const updateGoals = await Goal.findById(goals_id);
    if (!updateGoals) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    updateGoals.currentAmount += parsedAmount;

    if (updateGoals.currentAmount >= updateGoals.targetAmount) {
      updateGoals.currentAmount = updateGoals.targetAmount;
      updateGoals.completed = true;
    }
    await updateGoals.save();

    res.status(200).json({ message: 'successfully updated', goal: updateGoals });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/completed', async (req, res) => {
  try {
    const { _id } = req.user;
    const { goals_id } = req.body;

    if (!goals_id) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }

    if (!(await assertGoalOwnership(_id, goals_id, res))) return;

    const updateGoals = await Goal.findById(goals_id);
    if (!updateGoals) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    updateGoals.completed = true;
    updateGoals.currentAmount = updateGoals.targetAmount;
    await updateGoals.save();

    res.status(200).json({ message: 'successfully updated', goal: updateGoals });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
