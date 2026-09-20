import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/government.css';

/**
 * Professional Government-Style Data Table
 * Features: Sorting, Striped Rows, Responsive, Accessible
 */
export default function DataTable({
    columns = [],
    data = [],
    striped = true,
    sortable = true,
    className = '',
    ariaLabel = 'Data Table'
}) {
    const { t } = useTranslation();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Sorting logic
    const handleSort = (columnKey) => {
        if (!sortable) return;

        let direction = 'asc';
        if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: columnKey, direction });
    };

    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return '⇅';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="data-table-container">
            <table
                className={`data-table ${striped ? 'striped' : ''} ${className}`}
                role="table"
                aria-label={ariaLabel}
            >
                <thead>
                    <tr role="row">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                role="columnheader"
                                className={sortable && column.sortable !== false ? 'sortable' : ''}
                                onClick={() => column.sortable !== false && handleSort(column.key)}
                                aria-sort={
                                    sortConfig.key === column.key
                                        ? sortConfig.direction === 'asc'
                                            ? 'ascending'
                                            : 'descending'
                                        : 'none'
                                }
                                style={{
                                    width: column.width || 'auto',
                                    textAlign: column.align || 'left'
                                }}
                            >
                                <div className="th-content">
                                    <span>{column.label}</span>
                                    {sortable && column.sortable !== false && (
                                        <span className="sort-icon" aria-hidden="true">
                                            {getSortIcon(column.key)}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="empty-state">
                                No data available
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} role="row">
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        role="cell"
                                        style={{ textAlign: column.align || 'left' }}
                                        data-label={column.label}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row, rowIndex)
                                            : row[column.key]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Optional: Row count */}
            {data.length > 0 && (
                <div className="table-footer">
                    <span className="row-count">
                        Showing {sortedData.length} {sortedData.length === 1 ? 'entry' : 'entries'}
                    </span>
                </div>
            )}
        </div>
    );
}

/**
 * Usage Example:
 * 
 * const columns = [
 *   { key: 'district', label: 'District', sortable: true, width: '200px' },
 *   { key: 'farmers', label: 'Farmers', align: 'center', sortable: true },
 *   { key: 'yield', label: 'Yield (Tons)', align: 'right', sortable: true },
 *   { 
 *     key: 'status', 
 *     label: 'Status',
 *     render: (value) => (
 *       <span className={`badge ${value.toLowerCase()}`}>{value}</span>
 *     )
 *   }
 * ];
 * 
 * const data = [
 *   { id: 1, district: 'Vellore', farmers: 1250, yield: 4500, status: 'Optimal' },
 *   { id: 2, district: 'Thanjavur', farmers: 2100, yield: 5200, status: 'Good' }
 * ];
 * 
 * <DataTable columns={columns} data={data} />
 */
