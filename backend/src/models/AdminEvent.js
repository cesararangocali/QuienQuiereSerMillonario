import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class AdminEvent extends Model {}

AdminEvent.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  username: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.ENUM('lock','unlock'), allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: true },
}, { sequelize, modelName: 'AdminEvent' });
