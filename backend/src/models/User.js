import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';

export class User extends Model {
  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: true },
    passwordHash: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('admin', 'player'), allowNull: false, defaultValue: 'player' },
  },
  { sequelize, modelName: 'User' }
);

export async function createAdminIfNotExists() {
  const username = process.env.ADMIN_DEFAULT_USERNAME;
  const pass = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!username || !pass) return;
  const exists = await User.findOne({ where: { username } });
  if (!exists) {
    const passwordHash = await bcrypt.hash(pass, 10);
    await User.create({ name: 'Administrador', username, passwordHash, role: 'admin' });
    console.log('Admin inicial creado:', username);
  }
}
