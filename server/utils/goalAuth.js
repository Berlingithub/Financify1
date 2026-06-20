const User = require('../Models/User');

async function userOwnsGoal(userId, goalsId) {
  if (!goalsId) return false;
  const user = await User.findById(userId).select('goals');
  if (!user) return false;
  return user.goals.some((id) => String(id) === String(goalsId));
}

async function assertGoalOwnership(userId, goalsId, res) {
  const owns = await userOwnsGoal(userId, goalsId);
  if (!owns) {
    res.status(403).json({ message: 'Not authorized to access this goal' });
    return false;
  }
  return true;
}

module.exports = { userOwnsGoal, assertGoalOwnership };
