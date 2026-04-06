import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 5000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'toilet',
    password: process.env.DB_PASSWORD || 'toiletpw',
    database: process.env.DB_NAME || 'toiletmap',
  },
};
