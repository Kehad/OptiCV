import pg from 'pg';
const { Client } = pg;

async function migrate() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/resume_tailor'
  });
  
  try {
    await client.connect();
    await client.query('ALTER TABLE public."Application" ADD COLUMN IF NOT EXISTS "automationPreview" JSONB;');
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
