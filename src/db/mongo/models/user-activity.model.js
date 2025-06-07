const { Schema, model } = require('mongoose');

const userActivitySchema = new Schema({
  userId: {
    type: String, // PostgreSQL user ID
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['login', 'course_view', 'course_progress', 'test_attempt', 'certificate_earned', 'payment', 'profile_update'],
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  details: {
    type: Schema.Types.Mixed,
    required: true
  },
  metadata: {
    device: {
      type: String,
      required: true
    },
    browser: String,
    os: String,
    ip: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for common queries
userActivitySchema.index({ userId: 1, type: 1, timestamp: -1 });
userActivitySchema.index({ 'metadata.location.coordinates': '2dsphere' });

// Static method to get user activity summary
userActivitySchema.statics.getUserActivitySummary = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        userId,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }
    }
  ];

  return this.aggregate(pipeline);
};

// Static method to get user learning progress
userActivitySchema.statics.getUserLearningProgress = async function(userId) {
  const pipeline = [
    {
      $match: {
        userId,
        type: 'course_progress'
      }
    },
    {
      $group: {
        _id: '$details.courseId',
        totalTime: { $sum: '$details.duration' },
        lastProgress: { $max: '$timestamp' },
        progress: { $max: '$details.progress' }
      }
    }
  ];

  return this.aggregate(pipeline);
};

// Static method to get user performance metrics
userActivitySchema.statics.getUserPerformanceMetrics = async function(userId) {
  const pipeline = [
    {
      $match: {
        userId,
        type: 'test_attempt'
      }
    },
    {
      $group: {
        _id: null,
        averageWPM: { $avg: '$details.wpm' },
        averageAccuracy: { $avg: '$details.accuracy' },
        totalTests: { $sum: 1 },
        passedTests: {
          $sum: {
            $cond: [{ $eq: ['$details.passed', true] }, 1, 0]
          }
        }
      }
    }
  ];

  return this.aggregate(pipeline);
};

const UserActivity = model('UserActivity', userActivitySchema);

module.exports = UserActivity; 