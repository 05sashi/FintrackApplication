import express from 'express';
import auth from '../middleware/authMiddleware.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get all transactions for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/transactions
// @desc    Add a new transaction
// @access  Private
router.post('/', auth, async (req, res) => {
  const { type, amount, category, description, date } = req.body;

  try {
    const newTransaction = new Transaction({
      type,
      amount,
      category,
      description,
      userId: req.user.id,
      date: date ? new Date(date) : new Date()
    });

    const transaction = await newTransaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- THIS IS THE NEW CODE YOU NEED ---

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { type, amount, category, description, date } = req.body;

  // Build transaction object based on fields submitted
  const transactionFields = {};
  if (type) transactionFields.type = type;
  if (amount) transactionFields.amount = amount;
  if (category) transactionFields.category = category;
  if (description) transactionFields.description = description;
  if (date) transactionFields.date = date;

  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns the transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: transactionFields },
      { new: true } // This option returns the document after it has been updated
    );

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns the transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;