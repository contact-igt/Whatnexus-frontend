/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const handleXslxDownloadData = (data: any, fileName: string) => {
    // Convert JSON to worksheet
    console.log(data);

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Export to file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
};

export const handleCSVDownloadData = (data: any, fileName: string) => {
    // Custom CSV generation to handle phone numbers correctly for Excel opening
    // We prepend '="' and append '"' to phone numbers to force Excel to treat them as strings

    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map((row: any) => headers.map(header => {
            const value = row[header];
            // If it's a phone number (checking by key 'phone' or looking like a number with leading +)
            if (header === 'phone' || (typeof value === 'string' && value.startsWith('+'))) {
                // Return in ="value" format which Excel interprets as exact string
                return `="${value}"`;
            }
            // Handle other values, escaping commas if necessary
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            return value;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
};
