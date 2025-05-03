const authenticate = require('./user.js');
const { LoanModel } = require('./models.js');
const { addDays, isAfter } = require('date-fns');
const moment = require('moment');

// Add Loan
const addLoan = async (req, res) => {
    const { customer_id, item_description, loan_amount, issued_date, due_date, frequency, interest_rate, grace_days } = req.body;
    try {
        if (loan_amount <= 0) {
            return res.status(400).json({ error: 'Loan amount must be greater than zero' });
        }
        if (!due_date || isNaN(new Date(due_date))) {
            return res.status(400).json({ error: 'Invalid due date' });
        }
        const newLoan = new LoanModel({ customer_id, item_description, loan_amount, issued_date, due_date, frequency, interest_rate, grace_days });
        await newLoan.save();
        res.status(201).json({ message: 'Loan added successfully', loan: newLoan });
    } catch (error) {
        console.error('Adding Loan Error:', error);
        res.status(500).json({ error: 'Error adding loan' });
    }
};

// Get Loans
const getLoan = async (req, res) => {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    try {
        const loans = await LoanModel.find({ customer_id: customerId }).sort({ createdAt: -1 }).lean().skip(skip).limit(limit);
        if (!loans.length) {
            return res.status(404).json({ message: 'No loans found' });
        }
        res.status(200).json(loans);
    } catch (error) {
        console.error('Retriving Loan Error:', error);
        res.status(500).json({ error: 'Error fetching loans' });
    }
};

// Update Loan
const updateLoan = async (req, res) => {
    const { loanId } = req.params;
    const { customer_id, item_description, loan_amount, issued_date, due_date, frequency, interest_rate, grace_days } = req.body;
    try {
        let updatedData = {};
        if (customer_id) updatedData.customer_id = customer_id;
        if (item_description) updatedData.item_description = item_description;
        if (loan_amount) updatedData.loan_amount = loan_amount;
        if (issued_date) updatedData.issued_date = issued_date;
        if (due_date) updatedData.due_date = due_date;
        if (frequency) updatedData.frequency = frequency;
        if (interest_rate) updatedData.interest_rate = interest_rate;
        if (grace_days) updatedData.grace_days = grace_days;

        const updatedLoan = await LoanModel.findByIdAndUpdate(
            loanId, 
            updatedData, 
            { new: true }
        );
        if (!updatedLoan) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        res.status(200).json({ message: 'Loan updated successfully', loan: updatedLoan });
    } catch (error) {
        console.error('Updating Loan Error:', error);
        res.status(500).json({ error: 'Error updating loan' });
    }
};

// Delete Loan
const deleteLoan = async (req, res) => {
    const { loanId } = req.params;
    try {
        const deletedLoan = await LoanModel.findByIdAndDelete(loanId);
        if (!deletedLoan) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        res.status(200).json({ message: 'Loan deleted successfully' });
    } catch (error) {
        console.error('Deleting Loan Error:', error);
        res.status(500).json({ error: 'Error deleting loan' });
    }
};

// Add Repayment Tracking
const addRepayment = async (req, res) => {
    const { loanId } = req.params;
    const { amount_paid, payment_date } = req.body;
    try {
      if (amount_paid <= 0) {
          return res.status(400).json({ error: 'Repayment amount must be greater than zero' });
      } 
      const loan = await LoanModel.findById(loanId);
      if (!loan) return res.status(404).json({ error: 'Loan not found' });
        
      // Add repayment record
      loan.repayments.push({ amount_paid, payment_date });
  
      // Update loan status (now includes overdue check)
      const now = new Date();
      if (loan.loan_amount <= 0) {
        loan.status = 'paid';
      } else if (now > loan.due_date) {
        loan.status = 'overdue';
      } else {
        loan.status = 'pending';
      }

      await loan.save();
      res.status(201).json({ message: 'Repayment recorded', loan });
    } catch (error) {
        console.error('Adding Repayment Loan Error:', error);
        res.status(500).json({ error: 'Error recording repayment' });
    }
};

// Loan Summary - Total Loaned, Total Collected, Overdue Amount, Avg Repayment Time
const loanSummary = async (req, res) => {
    const { customerId } = req.params;

    try {
        const loans = await LoanModel.find({ customer_id: customerId });

        if (!loans.length) {
            return res.status(404).json({ message: 'No loans found for this customer' });
        }

        // Auto-tag overdue loans
        for (const loan of loans) {
            const graceEndDate = addDays(new Date(loan.due_date), loan.grace_days);
            const now = new Date();

            if (isAfter(now, graceEndDate) && loan.status !== 'overdue') {
                loan.status = 'overdue';
                await loan.save();
            }
        }

        let totalLoaned = 0;
        let totalCollected = 0;
        let overdueAmount = 0;
        let totalRepaymentTime = 0;
        let repaymentCount = 0;

        loans.forEach(loan => {
            totalLoaned += loan.loan_amount;

            const loanCollected = loan.repayments.reduce((acc, repayment) => acc + repayment.amount_paid, 0);
            totalCollected += loanCollected;

            if (loan.status === 'overdue') {
                overdueAmount += loan.loan_amount - loanCollected;
            }

            loan.repayments.forEach(repayment => {
                const diff = moment(repayment.payment_date).diff(moment(loan.issued_date), 'days');
                if (diff >= 0) {
                    totalRepaymentTime += diff;
                    repaymentCount++;
                }

            });
        });

        const avgRepaymentTime = repaymentCount ? totalRepaymentTime / repaymentCount : 0;

        res.status(200).json({
            totalLoaned,
            totalCollected,
            overdueAmount,
            avgRepaymentTime: Number(avgRepaymentTime.toFixed(2)),
        });

    } catch (error) {
        console.error('Loan Summary Error:', error);
        res.status(500).json({ error: 'Error fetching loan summary' });
    }
};

// Loan Overdue - List Overdue Loans for a Customer
const loanOverdue = async (req, res) => {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    try {
        // Update overdue statuses before fetching
        const allLoans = await LoanModel.find({ customer_id: customerId });

        for (const loan of allLoans) {
            const graceEndDate = addDays(new Date(loan.due_date), loan.grace_days);
            const now = new Date();

            if (isAfter(now, graceEndDate) && loan.status !== 'overdue') {
                loan.status = 'overdue';
                await loan.save();
            }
        }

        const overdues = await LoanModel.find({
            customer_id: customerId,
            status: 'overdue'
        }).skip(skip).limit(limit).lean();

        if (!overdues.length) {
            return res.status(404).json({ message: 'No overdue loans found for this customer' });
        }

        const overdueDetails = overdues.map(loan => {
            const paidAmount = loan.repayments.reduce((acc, repayment) => acc + repayment.amount_paid, 0);
            const balance = loan.loan_amount - paidAmount;
            const overdueDays = moment().diff(moment(loan.due_date), 'days');

            return {
                itemDescription: loan.item_description,
                loanAmount: loan.loan_amount,
                paid: paidAmount,
                balance,
                overdueDays,
            };
        });

        res.status(200).json(overdueDetails);

    } catch (error) {
        console.error('Loan Overdue Error:', error);
        res.status(500).json({ error: 'Error fetching overdue loans' });
    }
};

module.exports = {
    addLoan,
    getLoan,
    updateLoan,
    deleteLoan,
    addRepayment,
    loanSummary,
    loanOverdue,
};