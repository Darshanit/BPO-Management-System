/**
 * Converts an array of flat objects into CSV text.
 * Kept dependency-free (no 'json2csv') to minimize install footprint.
 */
const toCSV = (rows) => {
  if (!rows || rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };

  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  });

  return lines.join('\n');
};

module.exports = { toCSV };
