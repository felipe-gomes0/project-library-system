const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { LOAN_STATUS } = require('../utils/constants');

class Loan extends Model {
  get isLate() {
    if (this.status === LOAN_STATUS.RETURNED) return false;
    return new Date() > new Date(this.dueDate);
  }
}

Loan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reader_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    loanDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    returnDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(LOAN_STATUS)),
      allowNull: false,
      defaultValue: LOAN_STATUS.OPEN,
    },
  },
  {
    sequelize,
    modelName: 'Loan',
    tableName: 'loans',
  }
);

module.exports = Loan;
