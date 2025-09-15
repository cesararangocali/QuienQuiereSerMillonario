import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Question extends Model {}

Question.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    options: { type: DataTypes.JSON, allowNull: false },
    correctIndex: { type: DataTypes.INTEGER, allowNull: false },
    difficulty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    category: { type: DataTypes.STRING, allowNull: false },
    verseHint: { type: DataTypes.TEXT, allowNull: true },
  explanation: { type: DataTypes.TEXT, allowNull: true },
    source: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: 'Question' }
);
