const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { name, email, password, team_name } = req.body;

    if (!name || !email || !password || !team_name) {
      return res.status(400).json({ error: 'All fields required: name, email, password, team_name' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const teamResult = db.prepare('INSERT INTO teams (name) VALUES (?)').run(team_name);
    const teamId = teamResult.lastInsertRowid;

    const userResult = db.prepare(
      'INSERT INTO users (team_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(teamId, name, email, passwordHash, 'admin');
    const userId = userResult.lastInsertRowid;

    const token = jwt.sign(
      { id: userId, team_id: teamId, email, role: 'admin', name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: userId, name, email, role: 'admin', team_id: teamId, team_name }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare(
      'SELECT u.*, t.name as team_name FROM users u JOIN teams t ON u.team_id = t.id WHERE u.email = ?'
    ).get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, team_id: user.team_id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team_id: user.team_id,
        team_name: user.team_name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
