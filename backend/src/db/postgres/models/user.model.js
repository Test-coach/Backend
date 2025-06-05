const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { postgresConfig } = require('../../../config/database.config');
const pool = new Pool(postgresConfig);

class User {
  static async create({ username, email, password, role = 'user' }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert into users table
      const { rows: [user] } = await client.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, email, role, created_at`,
        [username, email, passwordHash, role]
      );

      // Create default preferences
      await client.query(
        `INSERT INTO user_preferences (user_id)
         VALUES ($1)`,
        [user.id]
      );

      await client.query('COMMIT');
      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT u.*, up.*, upref.*
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN user_preferences upref ON u.id = upref.user_id
       WHERE u.email = $1`,
      [email]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const { rows } = await pool.query(
      `SELECT u.*, up.*, upref.*
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN user_preferences upref ON u.id = upref.user_id
       WHERE u.username = $1`,
      [username]
    );
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT u.*, up.*, upref.*
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN user_preferences upref ON u.id = upref.user_id
       WHERE u.id = $1`,
      [id]
    );
    return rows[0];
  }

  static async updateProfile(userId, profileData) {
    const {
      firstName,
      lastName,
      avatar,
      bio,
      phoneNumber
    } = profileData;

    const { rows } = await pool.query(
      `INSERT INTO user_profiles 
       (user_id, first_name, last_name, avatar_url, bio, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         avatar_url = EXCLUDED.avatar_url,
         bio = EXCLUDED.bio,
         phone = EXCLUDED.phone,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, firstName, lastName, avatar, bio, phoneNumber]
    );
    return rows[0];
  }

  static async updatePreferences(userId, preferences) {
    const {
      language,
      fontSize,
      soundEnabled,
      theme
    } = preferences;

    const { rows } = await pool.query(
      `UPDATE user_preferences 
       SET theme = $1,
           metadata = jsonb_set(
             COALESCE(metadata, '{}'::jsonb),
             '{language,fontSize,soundEnabled}',
             to_jsonb($2::jsonb)
           )
       WHERE user_id = $3
       RETURNING *`,
      [theme, { language, fontSize, soundEnabled }, userId]
    );
    return rows[0];
  }

  static async updatePassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const { rows } = await pool.query(
      `UPDATE users 
       SET password_hash = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id`,
      [passwordHash, userId]
    );
    return rows[0];
  }

  static async verifyEmail(userId) {
    const { rows } = await pool.query(
      `UPDATE users 
       SET is_verified = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [userId]
    );
    return rows[0];
  }

  static async updateLastLogin(userId) {
    const { rows } = await pool.query(
      `UPDATE users 
       SET last_login = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [userId]
    );
    return rows[0];
  }

  static async comparePassword(userId, candidatePassword) {
    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    if (!rows[0]) return false;
    return bcrypt.compare(candidatePassword, rows[0].password_hash);
  }

  static async setResetPasswordToken(userId, token, expires) {
    const { rows } = await pool.query(
      `UPDATE users 
       SET reset_password_token = $1,
           reset_password_expires = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id`,
      [token, expires, userId]
    );
    return rows[0];
  }

  static async findByResetToken(token) {
    const { rows } = await pool.query(
      `SELECT * FROM users 
       WHERE reset_password_token = $1 
       AND reset_password_expires > CURRENT_TIMESTAMP`,
      [token]
    );
    return rows[0];
  }
}

module.exports = User; 