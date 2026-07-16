const mongoose = require('mongoose');
const APIFeatures = require('../utils/apiFeatures');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./dbSetup');

beforeAll(setupTestDB);
afterEach(clearTestDB);
afterAll(teardownTestDB);

// A minimal in-memory model just for exercising APIFeatures' query-building logic
const sampleSchema = new mongoose.Schema({ name: String, salary: Number, department: String });
const Sample = mongoose.model('Sample', sampleSchema);

describe('APIFeatures', () => {
  beforeEach(async () => {
    await Sample.create([
      { name: 'Alice', salary: 40000, department: 'eng' },
      { name: 'Bob', salary: 60000, department: 'eng' },
      { name: 'Carol', salary: 80000, department: 'sales' },
    ]);
  });

  it('filters by exact match', async () => {
    const features = new APIFeatures(Sample.find(), { department: 'eng' }).filter();
    const results = await features.query;
    expect(results).toHaveLength(2);
  });

  it('supports gte/lte range filters', async () => {
    const features = new APIFeatures(Sample.find(), { salary: { gte: 50000 } }).filter();
    const results = await features.query;
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.name).sort()).toEqual(['Bob', 'Carol']);
  });

  it('searches across specified fields case-insensitively', async () => {
    const features = new APIFeatures(Sample.find(), { search: 'ali' }).search(['name']);
    const results = await features.query;
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Alice');
  });

  it('sorts ascending and descending', async () => {
    const asc = await new APIFeatures(Sample.find(), { sort: 'salary' }).sort().query;
    expect(asc[0].name).toBe('Alice');

    const desc = await new APIFeatures(Sample.find(), { sort: '-salary' }).sort().query;
    expect(desc[0].name).toBe('Carol');
  });

  it('paginates and reports correct meta via countTotal', async () => {
    const features = new APIFeatures(Sample.find(), { page: 1, limit: 2 }).paginate();
    const results = await features.query;
    expect(results).toHaveLength(2);

    const meta = await features.countTotal(Sample);
    expect(meta.total).toBe(3);
    expect(meta.totalPages).toBe(2);
    expect(meta.page).toBe(1);
  });
});
