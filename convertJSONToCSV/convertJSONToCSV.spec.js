const {
  flattenObject,
  mergeData,
  getJsonFiles,
} = require('./convertJSONToCSV');
const fs = require('fs');

describe('flattenObject', () => {
  it('should flatten nested objects', () => {
    const rawData = {
      admin: {
        mapping: {
          assigned: 'zugewiesen',
          noAssignment: 'none',
          sold: 'verkauft',
          test1: 'test1'
        }
      }
    };

    const flattened = flattenObject(rawData);

    expect(flattened).toEqual({
      "admin.mapping.assigned": "zugewiesen",
      "admin.mapping.noAssignment": "none",
      "admin.mapping.sold": "verkauft",
      "admin.mapping.test1": "test1"
  });
  });
});

describe('mergeData', () => {
  it('should merge data from JSON files', () => {
    const jsonFiles = ['en-US.json', 'de-DE.json'];
    const flattenedData = [
      {
        'admin.mapping.assigned': 'zugewiesen',
        'admin.mapping.noAssignment': 'none',
        'admin.mapping.sold': 'verkauft',
        'admin.mapping.test1': 'test1'
      },
      {
        'admin.mapping.assigned': 'assigned',
        'admin.mapping.noAssignment': 'none',
        'admin.mapping.sold': 'sold',
        'admin.mapping.test2': 'test2'
      }
    ];

    const merged = mergeData(jsonFiles, flattenedData);

    expect(merged).toEqual({
      "admin.mapping.assigned": {
          "key": "admin.mapping.assigned",
          "en-US": "zugewiesen",
          "de-DE": "assigned"
      },
      "admin.mapping.noAssignment": {
          "key": "admin.mapping.noAssignment",
          "en-US": "none",
          "de-DE": "none"
      },
      "admin.mapping.sold": {
          "key": "admin.mapping.sold",
          "en-US": "verkauft",
          "de-DE": "sold"
      },
      "admin.mapping.test1": {
          "key": "admin.mapping.test1",
          "en-US": "test1"
      },
      "admin.mapping.test2": {
          "key": "admin.mapping.test2",
          "de-DE": "test2"
      }
  });
  });
});

describe('getJsonFiles', () => {
  it('should return an array of JSON file names in the directory', () => {
    jest.spyOn(fs, 'readdirSync').mockReturnValue(['en-US.json', 'de-DE.json']);

    const jsonFiles = getJsonFiles('./');

    expect(jsonFiles).toEqual(['en-US.json', 'de-DE.json']);
  });

  it('should return JSON file names from command line arguments', () => {
    process.argv = ['node', 'your-script.js', 'en-US.json', 'de-DE.json'];

    const jsonFiles = getJsonFiles('./');

    expect(jsonFiles).toEqual(['en-US.json', 'de-DE.json']);
  });
});
