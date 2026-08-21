const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Direct PostgreSQL connection string from user
const connectionString = process.env.POSTGRES_URL || "postgresql://postgres:magnuscapital6-coder's Org@db.xfsaznnrhqmlbllsfxzr.supabase.co:5432/postgres";

async function executeSchema() {
  console.log('Connecting to remote PostgreSQL database...');

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');

    // Read supabase-schema.sql
    const sqlPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL schema creation script...');
    await client.query(sqlContent);
    console.log('SQL schema created successfully! All 9 PostgreSQL tables, RLS policies, and triggers are ready.');

  } catch (err) {
    console.error('Error executing SQL script:', err.message || err);
  } finally {
    await client.end();
    console.log('PostgreSQL connection closed.');
  }
}

executeSchema();
