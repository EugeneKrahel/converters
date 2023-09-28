const fs = require('fs');

describe('nestKeys function', () => {
  it('should nest keys properly', () => {
    process.argv = ['node', 'convertCSVToJSON.js', 'mock.csv'];
    const { nestKeys } = require('./convertCSVToJSON');
    const obj = {};
    nestKeys(obj, ['a', 'b', 'c'], 'value');
    expect(obj).toEqual({ a: { b: { c: 'value' } } });
  });
});

describe('createJSONs', () => {
  it('should create JSON files from CSV', async () => {
    process.argv = ['node', 'convertCSVToJSON.js', 'mock.csv'];

    const { createJSONs } = require('./convertCSVToJSON');
    const inputFileName = 'mock.csv';
    jest.spyOn(fs, 'createReadStream').mockReturnValueOnce({
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback({ 'keyString.lang1': 'value1', 'keyString.lang2': 'value2' });
        } else if (event === 'end') {
          callback();
        }
      })
    });

    jest.spyOn(fs, 'writeFileSync').mockReturnValueOnce(undefined);

    await expect(createJSONs(inputFileName)).resolves.toBeUndefined();

    expect(fs.createReadStream).toHaveBeenCalledWith(inputFileName);
    expect(fs.writeFileSync).toHaveBeenCalledWith('keyString.lang2.json', JSON.stringify({
      'value1': 'value2'
    }, null, 2));
  });

  it('should reject with an error when CSV file does not exist', async () => {
    process.argv = ['node', 'convertCSVToJSON.js', 'nonexistent.csv'];

    const { createJSONs } = require('./convertCSVToJSON');
    const inputFileName = 'nonexistent.csv';

    jest.spyOn(fs, 'createReadStream').mockReturnValueOnce({
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          callback(new Error('File not found'));
        }
      }),
    });

    await expect(createJSONs(inputFileName)).rejects.toThrow('File not found');
  });
});
