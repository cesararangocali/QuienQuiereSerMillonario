import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Ranking extends Model {}

Ranking.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    playerName: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 30]
      }
    },
    points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { 
    sequelize, 
    modelName: 'Ranking',
    indexes: [
      {
        unique: true,
        fields: ['playerName']
      },
      {
        fields: ['points']
      }
    ]
  }
);
