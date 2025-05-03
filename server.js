const express = require('express');
const cors = require('cors');
const { userRegisteration, userLogin, authenticate } = require('./user.js');
const { addCustomer, getCustomer, updateCustomer, deleteCustomer } = require('./customer.js');
const { addLoan, getLoan, updateLoan, deleteLoan, addRepayment, loanSummary, loanOverdue } = require('./loan.js');

const app = express();
app.use(cors());
app.use(express.json());

// user routes
app.post('/user/register', userRegisteration);
app.post('/user/login', userLogin);

// customer routes
app.post('/add/customer', authenticate, addCustomer);
app.get('/get/customer/:userId', authenticate, getCustomer);
app.put('/update/customer/:customerId', authenticate, updateCustomer);
app.delete('/delete/customer/:customerId', authenticate, deleteCustomer);

// loan routes
app.post('/add/loan', authenticate, addLoan);
app.get('/get/loan/:customerId', authenticate, getLoan);
app.put('/update/loan/:loanId', authenticate, updateLoan);
app.delete('/delete/loan/:loanId', authenticate, deleteLoan);
app.post('/loan/repayment/:loanId', authenticate, addRepayment);
app.get('/loan/summary/:customerId', authenticate, loanSummary);
app.get('/loan/overdue/:customerId', authenticate, loanOverdue);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

