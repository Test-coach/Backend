const { Schema, model } = require('mongoose');

const testPassageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  test: {
    type: Schema.Types.ObjectId,
    ref: 'TypingTest',
    required: true,
    index: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['started', 'completed', 'failed', 'abandoned'],
    default: 'started',
    index: true
  },
  performance: {
    wpm: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    },
    errors: {
      type: Number,
      default: 0
    },
    correctChars: {
      type: Number,
      default: 0
    },
    totalChars: {
      type: Number,
      default: 0
    },
    backspaceCount: {
      type: Number,
      default: 0
    }
  },
  keystrokes: [{
    character: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    isError: {
      type: Boolean,
      default: false
    },
    position: {
      type: Number,
      required: true
    }
  }],
  errorDetails: [{
    expectedChar: String,
    typedChar: String,
    position: Number,
    word: String,
    timestamp: Date
  }],
  result: {
    passed: {
      type: Boolean,
      default: false
    },
    certificate: {
      issued: {
        type: Boolean,
        default: false
      },
      url: String,
      issuedAt: Date
    }
  },
  device: {
    userAgent: String,
    browser: String,
    os: String,
    device: String
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
testPassageSchema.index({ user: 1, test: 1 });
testPassageSchema.index({ course: 1, status: 1 });
testPassageSchema.index({ startTime: -1 });
testPassageSchema.index({ 'performance.wpm': -1 });

// Virtual for test duration
testPassageSchema.virtual('testDuration').get(function() {
  if (!this.endTime) return 0;
  return Math.round((this.endTime - this.startTime) / 1000);
});

// Pre-save middleware to calculate performance metrics
testPassageSchema.pre('save', function(next) {
  if (this.isModified('keystrokes')) {
    // Calculate WPM
    const wordCount = this.performance.correctChars / 5; // Standard: 5 characters = 1 word
    const timeInMinutes = this.duration / 60;
    this.performance.wpm = Math.round(wordCount / timeInMinutes);

    // Calculate accuracy
    this.performance.accuracy = Math.round(
      (this.performance.correctChars / this.performance.totalChars) * 100
    );
  }
  next();
});

const TestPassage = model('TestPassage', testPassageSchema);

module.exports = TestPassage; 