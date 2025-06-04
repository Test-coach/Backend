const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'upi', 'netbanking', 'wallet']
  },
  couponApplied: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  originalAmount: {
    type: Number,
    required: true
  },
  payment: {
    transactionId: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    status: {
      type: String,
      enum: ['initiated', 'processing', 'success', 'failed'],
      default: 'initiated'
    },
    method: String,
    gateway: String,
    gatewayResponse: Schema.Types.Mixed,
    paidAt: Date
  },
  accessExpiry: {
    type: Date,
    required: true
  },
  invoice: {
    number: String,
    url: String,
    generatedAt: Date
  },
  notes: String,
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, course: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.transactionId': 1 });

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD${year}${month}${day}${random}`;
  }
  next();
});

const Order = model('Order', orderSchema);

module.exports = Order; 