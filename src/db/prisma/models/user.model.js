const bcrypt = require('bcrypt');
const prisma = require('../../prisma');

class User {
  static async create({ username, email, password, role = 'user' }) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user with Prisma
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password_hash: passwordHash,
          role,
          preferences: {
            create: {} // Creates default preferences
          }
        },
        include: {
          preferences: true
        }
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        preferences: true
      }
    });
  }

  static async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        preferences: true
      }
    });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        preferences: true
      }
    });
  }

  static async updateProfile(userId, profileData) {
    const {
      firstName,
      lastName,
      avatar,
      bio,
      phoneNumber
    } = profileData;

    return prisma.userProfile.upsert({
      where: { user_id: userId },
      update: {
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatar,
        bio,
        phone: phoneNumber
      },
      create: {
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatar,
        bio,
        phone: phoneNumber
      }
    });
  }

  static async updatePreferences(userId, preferences) {
    const {
      language,
      fontSize,
      soundEnabled,
      theme
    } = preferences;

    return prisma.userPreference.update({
      where: { user_id: userId },
      data: {
        theme,
        email_notifications: {
          language,
          fontSize,
          soundEnabled
        }
      }
    });
  }

  static async updatePassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    return prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: passwordHash
      }
    });
  }

  static async verifyEmail(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        is_verified: true
      }
    });
  }

  static async updateLastLogin(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        last_login: new Date()
      }
    });
  }

  static async comparePassword(userId, candidatePassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true }
    });
    
    if (!user) return false;
    return bcrypt.compare(candidatePassword, user.password_hash);
  }

  static async setResetPasswordToken(userId, token, expires) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        reset_password_token: token,
        reset_password_expires: expires
      }
    });
  }

  static async findByResetToken(token) {
    return prisma.user.findFirst({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          gt: new Date()
        }
      }
    });
  }
}

module.exports = User; 