import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Prayer extends Model {}

Prayer.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING, unique: true, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: 'Prayer' }
);
