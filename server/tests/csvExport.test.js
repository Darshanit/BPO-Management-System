const { toCSV } = require('../utils/csvExport');

describe('toCSV', () => {
  it('returns an empty string for no rows', () => {
    expect(toCSV([])).toBe('');
    expect(toCSV(null)).toBe('');
  });

  it('renders a header row followed by one line per record', () => {
    const csv = toCSV([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('name,age');
    expect(lines[1]).toBe('Alice,30');
    expect(lines[2]).toBe('Bob,25');
  });

  it('quotes and escapes values containing commas, quotes, or newlines', () => {
    const csv = toCSV([{ name: 'Smith, John', note: 'Said "hello"' }]);
    const lines = csv.split('\n');

    expect(lines[1]).toBe('"Smith, John","Said ""hello"""');
  });

  it('renders null/undefined values as empty strings', () => {
    const csv = toCSV([{ name: 'Alice', nickname: null, note: undefined }]);
    const lines = csv.split('\n');

    expect(lines[1]).toBe('Alice,,');
  });
});
