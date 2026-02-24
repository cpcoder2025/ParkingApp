/**
 * One-time fix: delete payment rows where booking_id is NULL
 * so TypeORM sync can set booking_id NOT NULL.
 * Run from backend folder: npm run db:fix-payments
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';

config({ path: resolve(__dirname, '..', '.env') });

async function main() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'parking_db',
  });
  await client.connect();
  const res = await client.query(
    'DELETE FROM payments WHERE booking_id IS NULL RETURNING id',
  );
  const deleted = res.rowCount ?? 0;
  console.log(`Deleted ${deleted} payment row(s) with null booking_id.`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
