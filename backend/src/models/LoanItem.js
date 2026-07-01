const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Tabela de junção entre Loan e Book (um empréstimo pode ter um ou mais livros)
class LoanItem extends Model {}

LoanItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    loan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: { args: [1], msg: 'A quantidade deve ser ao menos 1' } },
    },
  },
  {
    sequelize,
    modelName: 'LoanItem',
    tableName: 'loan_items',
  }
);

module.exports = LoanItem;
