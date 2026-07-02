import { Children, isValidElement } from 'react';
import EmptyState from './EmptyState';

function Column() {
  return null;
}

export default function DataTable({ items, rowKey = 'id', empty, children }) {
  const columns = Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === Column)
    .map((child) => child.props);

  if (!items || items.length === 0) {
    return empty || <EmptyState title="Nenhum registro encontrado" />;
  }

  const cellValue = (col, item) => (col.render ? col.render(item) : item[col.field]);

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={col.header || i} className={col.align === 'center' ? 'center' : ''}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item[rowKey]}>
            {columns.map((col, i) => (
              <td key={col.header || i} className={col.align === 'center' ? 'center' : ''}>
                {cellValue(col, item)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

DataTable.Column = Column;
