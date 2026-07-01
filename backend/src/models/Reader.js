const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { READER_STATUS } = require('../utils/constants');

class Reader extends Model {}

Reader.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'O nome é obrigatório' } },
    },
    // CPF ou RA (Registro Acadêmico) - identificador único do leitor
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Já existe um leitor com este CPF/RA' },
      validate: { notEmpty: { msg: 'O CPF/RA é obrigatório' } },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Já existe um leitor com este e-mail' },
      validate: { isEmail: { msg: 'E-mail inválido' } },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(READER_STATUS)),
      allowNull: false,
      defaultValue: READER_STATUS.ACTIVE,
    },
    // Vínculo opcional com uma conta de login (User com role=reader)
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Reader',
    tableName: 'readers',
  }
);

module.exports = Reader;
