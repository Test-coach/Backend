const { Schema, model } = require('mongoose');

const typingTestSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  description: String,
  duration: {
    type: Number, // in minutes
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    index: true
  },
  passage: {
    content: {
      type: String,
      required: true
    },
    wordCount: {
      type: Number,
      required: true
    },
    language: {
      type: String,
      default: 'English'
    },
    category: {
      type: String,
      enum: ['general', 'technical', 'legal', 'medical', 'academic'],
      default: 'general'
    }
  },
  requirements: {
    minWPM: {
      type: Number,
      default: 0
    },
    maxErrors: {
      type: Number,
      default: null
    },
    minAccuracy: {
      type: Number,
      default: 0
    }
  },
  settings: {
    allowBackspace: {
      type: Boolean,
      default: true
    },
    caseSensitive: {
      type: Boolean,
      default: false
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    highlightErrors: {
      type: Boolean,
      default: true
    },
    soundEnabled: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageWPM: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
typingTestSchema.index({ title: 1 });
typingTestSchema.index({ course: 1, difficulty: 1 });
typingTestSchema.index({ 'stats.averageWPM': -1 });

const TypingTest = model('TypingTest', typingTestSchema);

module.exports = TypingTest; 