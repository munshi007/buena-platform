export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
};

// Pure helper for parsing TSV from spreadsheet paste
export const parseTSV = (text: string) => {
    return text.split('\n').map(row => row.split('\t'));
};
