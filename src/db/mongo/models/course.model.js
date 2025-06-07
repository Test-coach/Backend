const { Schema, model } = require('mongoose');

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in days
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  features: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['government', 'corporate', 'academic', 'general'],
    index: true
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  tests: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    duration: {
      type: Number, // in minutes
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    minWPM: {
      type: Number,
      default: 0
    },
    maxErrors: {
      type: Number,
      default: null
    }
  }],
  requirements: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ title: 1 });
courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ slug: 1 }, { unique: true });

const Course = model('Course', courseSchema);

module.exports = Course; 