function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

module.exports = { sanitizeUser };
