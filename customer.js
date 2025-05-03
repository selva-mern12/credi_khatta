const authenticate = require('./user.js');
const { CustomerModel } = require('./models.js');

// Add Customer
const addCustomer = async (req, res) => {
    const { user_id, name, phone, address, trust_score, credit_limit } = req.body;
    try {
        if (!name || !phone || !address) {
            return res.status(400).json({ error: 'Name, phone, and address are required' });
        }        
        const existingCustomer = await CustomerModel.findOne({ phone, user_id });
        
        if (existingCustomer) {
            return res.status(400).json({ error: 'Customer with this phone number already exists' });
        }
        const newCustomer = new CustomerModel({ user_id, name, phone, address, trust_score, credit_limit });
        await newCustomer.save();
        res.status(201).json({ message: 'Customer added successfully', customer: newCustomer });
    } catch (error) {
        console.error('Adding Customer Error:', error);
        res.status(500).json({ error: 'Error adding customer' });    
    }
};

// Get Customers
const getCustomer = async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    try {
        const customers = await CustomerModel.find({ user_id: userId }).sort({ createdAt: -1 }).lean().skip(skip).limit(limit);
        console.log('Customers:', customers);
        
        if (customers.length < 1) {
            return res.status(404).json({ message: 'No customers found' });
        }
        res.status(200).json(customers);
    } catch (error) {
        console.error('Retrieving Customer Error:', error);
        res.status(500).json({ error: 'Error fetching customers' });
    }
};

// Update Customer
const updateCustomer = async (req, res) => {
    const { customerId } = req.params;
    const { name, phone, address, trust_score, credit_limit } = req.body;

    try {
        if (!name && !phone && !address && !trust_score && !credit_limit) {
            return res.status(400).json({ error: 'At least one field is required for update' });
        }

        const updatedData = {};
        if (name) updatedData.name = name;
        if (phone) updatedData.phone = phone;
        if (address) updatedData.address = address;
        if (trust_score) updatedData.trust_score = trust_score;
        if (credit_limit) updatedData.credit_limit = credit_limit;

        const updatedCustomer = await CustomerModel.findByIdAndUpdate(
            customerId, 
            updatedData,  // Update here without wrapping in another object
            { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer });
    } catch (error) {
        console.error('Updating Customer Error:', error);
        res.status(500).json({ error: 'Error updating customer' });
    }
};

// Delete Customer
const deleteCustomer = async (req, res) => {
    const { customerId } = req.params;
    try {
        const deletedCustomer = await CustomerModel.findByIdAndDelete(customerId);
        if (!deletedCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Deleting Customer Error:', error);
        res.status(500).json({ error: 'Error deleting customer' });
    }
};

module.exports = {
    addCustomer,
    getCustomer,
    updateCustomer,
    deleteCustomer,
};