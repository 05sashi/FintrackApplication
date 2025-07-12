import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  amount: Number,
  type: String,
  category: String,
  description: String,
  date: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});


export default mongoose.model('Transaction', transactionSchema);
