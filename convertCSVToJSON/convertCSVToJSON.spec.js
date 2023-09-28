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

describe('createJSONs function', () => {
  jest.mock('fs');
  const mockCreateReadStream = jest.fn();
  const mockWriteFileSync = jest.fn();
  const csvData = [
    { 'keyString': 'key1', 'en': 'English Value 1', 'fr': 'French Value 1' },
    { 'keyString': 'key2', 'en': 'English Value 2', 'fr': 'French Value 2' },
  ];

  beforeEach(() => {
    process.argv = ['node', 'convertCSVToJSON.js', 'mock.csv'];
    jest.clearAllMocks();
  });

  it('should create JSON files for each language', async () => {
    const { createJSONs } = require('./convertCSVToJSON');
    const fileName = 'mock.csv';
    mockCreateReadStream.mockReturnValue({
      pipe: jest.fn(() => ({
        on: (event, callback) => {
          if (event === 'data') {
            csvData.forEach(callback);
          } else if (event === 'end') {
            callback();
          }
        },
        on: (event, callback) => {
          if (event === 'data') {
            csvData.forEach(callback);
          } else if (event === 'end') {
            callback();
          }
        },
      })),
      on: jest.fn(),
    });

    await createJSONs(fileName);

    expect(mockCreateReadStream).toHaveBeenCalledWith(fileName);
    expect(mockWriteFileSync).toHaveBeenCalledTimes(2);
    expect(mockWriteFileSync).toHaveBeenCalledWith('en.json', expect.any(String));
    expect(mockWriteFileSync).toHaveBeenCalledWith('fr.json', expect.any(String));
  });

  it('should reject on stream error', async () => {
    const { createJSONs } = require('./convertCSVToJSON');
    const fileName = 'sample.csv';
    const errorMsg = 'File not found';
    mockCreateReadStream.mockReturnValue({
      pipe: jest.fn(() => ({
        on: (event, callback) => {
          if (event === 'error') {
            callback(new Error(errorMsg));
          }
        },
      })),
      on: jest.fn(),
    });

    await expect(createJSONs(fileName)).rejects.toThrowError(errorMsg);
  });
});

