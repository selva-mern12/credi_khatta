const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
const connectServerToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

connectServerToDB();

// SCHEMAS

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  shop_name: { type: String, required: true },
  username:  {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: v => /^[A-Za-z0-9_]+$/.test(v),
        message: props => `${props.value} is not a valid username! Use only letters, numbers, or underscores.`,
      },
    },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true, },
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  phone:        { type: String, required: true, unique: true },
  address:      { type: String, required: true },
  trust_score:  { type: Number, default: 0, min: 0, max: 10 },
  credit_limit: { type: Number, default: 0 }}
, { timestamps: true });

const loanSchema = new mongoose.Schema(
  {
    customer_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    item_description: { type: String, required: true },
    loan_amount:      { type: Number, required: true },
    issued_date:      { type: Date, default: Date.now },
    due_date:         { type: Date, required: true },
    frequency:        { type: String, enum: ['bi-weekly', 'monthly'], required: true },
    interest_rate:    { type: Number, required: true },
    grace_days:       { type: Number, default: 0 },
    status:           { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    repayments: [
      {
        amount_paid: { type: Number, required: true },
        payment_date: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

// MODELS
const UserModel = mongoose.model('User', userSchema);
const CustomerModel = mongoose.model('Customer', customerSchema);
const LoanModel = mongoose.model('Loan', loanSchema);

// EXPORT
module.exports = {
  UserModel,
  CustomerModel,
  LoanModel,
};
