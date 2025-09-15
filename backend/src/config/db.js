import { Sequelize } from 'sequelize';

const storage = process.env.DB_STORAGE || './data/dev.sqlite';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});
