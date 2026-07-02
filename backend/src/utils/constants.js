const ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian',
  READER: 'reader',
};

const ROLE_VALUES = Object.values(ROLES);

const BOOK_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
};

const READER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const LOAN_STATUS = {
  OPEN: 'open',
  RETURNED: 'returned',
  LATE: 'late',
};

module.exports = {
  ROLES,
  ROLE_VALUES,
  BOOK_STATUS,
  READER_STATUS,
  LOAN_STATUS,
};
