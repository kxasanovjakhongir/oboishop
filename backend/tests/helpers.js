const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Creates an admin (or reuses one already in the test DB) and returns a
// valid bearer token — the same shape routes/auth.js issues on login,
// without going through the HTTP login endpoint for every test.
async function makeAdminToken() {
  let admin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
  if (!admin) {
    admin = await Admin.create({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
  }
  return jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { makeAdminToken };
