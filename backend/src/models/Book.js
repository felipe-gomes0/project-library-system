const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { BOOK_STATUS } = require('../utils/constants');

class Book extends Model {
  refreshStatus() {
    this.status =
      this.availableQuantity > 0 ? BOOK_STATUS.AVAILABLE : BOOK_STATUS.UNAVAILABLE;
  }
}

Book.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'O título é obrigatório' } },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'O autor é obrigatório' } },
    },
    publisher: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    publicationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isInt: { msg: 'O ano de publicação deve ser um número' } },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Já existe um livro com este ISBN' },
      validate: { notEmpty: { msg: 'O ISBN é obrigatório' } },
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: { args: [0], msg: 'A quantidade total não pode ser negativa' } },
    },
    availableQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: { args: [0], msg: 'A quantidade disponível não pode ser negativa' } },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BOOK_STATUS)),
      allowNull: false,
      defaultValue: BOOK_STATUS.AVAILABLE,
    },
    coverUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
  }
);

module.exports = Book;
