const { Pool } = require('pg');
const config = require('./config/config');

const pool = new Pool(config.db);

async function createMissingProfiles() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(`
      INSERT INTO user_profiles (user_id, full_name, avatar_url, bio)
      SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name), '', ''
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE up.user_id IS NULL
    `);

    console.log(`Created ${result.rowCount} missing user profiles`);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating missing profiles:', err);
  } finally {
    client.release();
  }
}

createMissingProfiles().then(() => process.exit());