const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { UserModel } = require('./models.js');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware for JWT Authentication
const authenticate = (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response
        .status(401)
        .json({ error: 'Authorization header is missing or malformed' });
    }
  
    const token = authHeader.split(' ')[1];
    if (!token) {
      return response
        .status(401)
        .json({ error: 'Token not provided' });
    }
  
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
      request.user = { id: payload.id, username: payload.username };
      next();
    });
};

// User Registration
const userRegisteration = async (req, res) => {
    const { name, shop_name, username, email, password } = req.body;
    try {
        if (!name || !shop_name || !username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                error: existingUser.username === username 
                       ? 'Username already exists' 
                       : 'Email already exists'
            });
        }
        let passwordError = null;
        if (password.length < 6) passwordError = 'Password must be at least 6 characters long';
        if (!/[A-Z]/.test(password)) passwordError = 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(password)) passwordError = 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(password)) passwordError = 'Password must contain at least one number';
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\\/?_]/.test(password)) passwordError = 'Password must contain at least one special character';
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ name, shop_name, username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            if (error.errors.username) {
                return res.status(400).json({
                    error: error.errors.username.message
                });
            }

            if (error.errors.password) {
                return res.status(400).json({
                    error: error.errors.password.message
                });
            }
            return res.status(400).json({ error: 'Validation error occurred' });
        }
        res.status(500).json({ error: 'Error registering user' });
    }
};

// User Login
const userLogin = async (req, res) => {
    const { user, password } = req.body;
    try {
        if (!user || !password) {
            return res.status(400).json({ error: 'Username/email and password are required' });
        }
        // Check if user is email or username 
               
        const trimmedUser = user.trim();
        const checkUser = trimmedUser.includes('@gmail.com') ? 
            await UserModel.findOne({ email: trimmedUser }) : 
            await UserModel.findOne({ username: trimmedUser });

        console.log('checkUser:', checkUser);
        if (!checkUser) {
            return res.status(400).json({ error: 'Invalid crendial' });
        }
        const isPasswordValid = await bcrypt.compare(password, checkUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        const token = jwt.sign({ id: checkUser._id, username: checkUser.username }, JWT_SECRET);
        res.status(200).json({ 
            token, 
            user: { user_id: checkUser._id, username: checkUser.username, name: checkUser.name, shop_name: checkUser.shop_name } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

module.exports = {
    userRegisteration,
    userLogin,
    authenticate,
};