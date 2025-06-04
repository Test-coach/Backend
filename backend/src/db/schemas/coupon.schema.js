const { Schema, model } = require('mongoose');

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  minPurchase: {
    type: Number,
    min: 0
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  maxUses: {
    type: Number,
    default: null
  },
  usesCount: {
    type: Number,
    default: 0
  },
  maxUsesPerUser: {
    type: Number,
    default: 1
  },
  applicableCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  excludedCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  userGroups: [{
    type: String,
    enum: ['all', 'new', 'existing', 'premium']
  }],
  metadata: {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    campaign: String,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ isActive: 1 });

// Methods
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.maxUses === null || this.usesCount < this.maxUses)
  );
};

couponSchema.methods.calculateDiscount = function(amount) {
  if (!this.isValid()) return 0;

  if (this.minPurchase && amount < this.minPurchase) return 0;

  let discount = 0;
  if (this.type === 'percentage') {
    discount = (amount * this.value) / 100;
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else {
    discount = this.value;
  }

  return Math.min(discount, amount);
};

// Statics
couponSchema.statics.findValidCoupons = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { maxUses: null },
      { usesCount: { $lt: '$maxUses' } }
    ]
  });
};

const Coupon = model('Coupon', couponSchema);

module.exports = Coupon; 