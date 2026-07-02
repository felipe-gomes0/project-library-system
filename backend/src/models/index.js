const sequelize = require("../config/database");

const User = require("./User");
const Reader = require("./Reader");
const Book = require("./Book");
const Loan = require("./Loan");
const LoanItem = require("./LoanItem");

User.hasOne(Reader, { foreignKey: "user_id", as: "readerProfile" });
Reader.belongsTo(User, { foreignKey: "user_id", as: "user" });

Reader.hasMany(Loan, { foreignKey: "reader_id", as: "loans" });
Loan.belongsTo(Reader, { foreignKey: "reader_id", as: "reader" });

Loan.belongsToMany(Book, {
	through: LoanItem,
	foreignKey: "loan_id",
	otherKey: "book_id",
	as: "books",
});
Book.belongsToMany(Loan, {
	through: LoanItem,
	foreignKey: "book_id",
	otherKey: "loan_id",
	as: "loans",
});

Loan.hasMany(LoanItem, { foreignKey: "loan_id", as: "items" });
LoanItem.belongsTo(Loan, { foreignKey: "loan_id", as: "loan" });
LoanItem.belongsTo(Book, { foreignKey: "book_id", as: "book" });
Book.hasMany(LoanItem, { foreignKey: "book_id", as: "loanItems" });

const db = {
	sequelize,
	User,
	Reader,
	Book,
	Loan,
	LoanItem,
};

module.exports = db;
