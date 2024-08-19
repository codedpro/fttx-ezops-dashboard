import sql, { ConnectionPool } from 'mssql';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const config = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  server: process.env.DB_SERVER as string,
  database: process.env.DB_NAME as string,
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // SSL Self Signed ?
  },
};

let pool: ConnectionPool | null = null;

async function connectToDatabase(): Promise<ConnectionPool | null> {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('Connected to SQL Server');
    } catch (error) {
      console.error('Failed to connect to SQL Server:', error);
      pool = null;
    }
  }
  return pool;
}

export { connectToDatabase };
