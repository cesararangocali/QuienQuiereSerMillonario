import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class GameAnswer extends Model {}

GameAnswer.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    difficulty: { type: DataTypes.INTEGER, allowNull: false },
    questionId: { type: DataTypes.INTEGER, allowNull: false },
    playerName: { type: DataTypes.STRING, allowNull: false },
    correct: { type: DataTypes.BOOLEAN, allowNull: false },
    answerIndex: { type: DataTypes.INTEGER, allowNull: true },
    pointsAwarded: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, modelName: 'GameAnswer' }
);
