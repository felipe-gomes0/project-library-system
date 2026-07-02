const { Op, fn, col } = require('sequelize');
const { Book, Reader, Loan } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { LOAN_STATUS, READER_STATUS, BOOK_STATUS } = require('../utils/constants');

exports.summary = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  await Loan.update(
    { status: LOAN_STATUS.LATE },
    { where: { status: LOAN_STATUS.OPEN, dueDate: { [Op.lt]: today } } }
  );

  const [
    totalBooks,
    availableBooks,
    totalCopies,
    availableCopies,
    totalReaders,
    activeReaders,
    totalLoans,
    openLoans,
    lateLoans,
    returnedLoans,
  ] = await Promise.all([
    Book.count(),
    Book.count({ where: { status: BOOK_STATUS.AVAILABLE } }),
    Book.sum('totalQuantity'),
    Book.sum('availableQuantity'),
    Reader.count(),
    Reader.count({ where: { status: READER_STATUS.ACTIVE } }),
    Loan.count(),
    Loan.count({ where: { status: LOAN_STATUS.OPEN } }),
    Loan.count({ where: { status: LOAN_STATUS.LATE } }),
    Loan.count({ where: { status: LOAN_STATUS.RETURNED } }),
  ]);

  res.json({
    status: 'success',
    data: {
      books: {
        total: totalBooks,
        available: availableBooks,
        totalCopies: totalCopies || 0,
        availableCopies: availableCopies || 0,
        borrowedCopies: (totalCopies || 0) - (availableCopies || 0),
      },
      readers: { total: totalReaders, active: activeReaders, inactive: totalReaders - activeReaders },
      loans: { total: totalLoans, open: openLoans, late: lateLoans, returned: returnedLoans },
    },
  });
});

exports.popularBooks = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 50);

  const rows = await Book.findAll({
    attributes: {
      include: [[fn('COALESCE', fn('SUM', col('loanItems.quantity')), 0), 'borrowCount']],
    },
    include: [{ association: 'loanItems', attributes: [] }],
    group: ['Book.id'],
    order: [[fn('COALESCE', fn('SUM', col('loanItems.quantity')), 0), 'DESC']],
    limit,
    subQuery: false,
  });

  res.json({ status: 'success', data: rows });
});
