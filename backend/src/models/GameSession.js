import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class GameSession extends Model {}

GameSession.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    roomId: { type: DataTypes.STRING, allowNull: false },
    startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    endedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'GameSession' }
);
