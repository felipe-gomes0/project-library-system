function getPagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildPage({ count, rows, page, limit }) {
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit) || 1,
    },
  };
}

module.exports = { getPagination, buildPage };
