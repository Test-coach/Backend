class UserRepository {
  constructor(fastify) {
    this.fastify = fastify;
  }

  async findByUsernameOrEmail(username, email) {
    const client = await this.fastify.pg.connect();
    try {
      const { rows } = await client.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );
      return rows;
    } finally {
      client.release();
    }
  }

  async findByUsername(username) {
    const client = await this.fastify.pg.connect();
    try {
      const { rows } = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return rows[0];
    } finally {
      client.release();
    }
  }

  async createUser({ username, password, email }) {
    const client = await this.fastify.pg.connect();
    try {
      const { rows } = await client.query(
        'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, password, email]
      );
      return rows[0];
    } finally {
      client.release();
    }
  }
}

module.exports = UserRepository; 