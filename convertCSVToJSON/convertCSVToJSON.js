const fs = require('fs');
const csv = require('csv-parser');

function nestKeys(current, keys, value) {
  const key = keys.shift();
  if (keys.length === 0) {
    if (value) {
      current[key] = value;
    }
  } else {
    current[key] = current[key] || {};
    nestKeys(current[key], keys, value);
  }
}

function createJSONs(fileName) {
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(fileName).pipe(csv());
    stream.on('error', err => reject(err));
    stream.on('data', row => {
      const [keyString, ...langs] = Object.keys(row);

      langs.forEach(lang => {
        const keys = row[keyString].split('.')
        if (!jsonData[lang]) {
          jsonData[lang] = {};
        }

        const current = jsonData[lang];
        const value = row[lang];

        nestKeys(current, keys, value);
      })
    });
    stream.on('end', () => {
      for (const lang in jsonData) {
        const outputFile = `${lang}.json`;
        resolve(fs.writeFileSync(outputFile, JSON.stringify(jsonData[lang], null, 2)));
      }
    });
  });
}

if (process.argv.length !== 3) {
  console.error('Usage: node convertCSVToJSON.js <input-csv-file>');
  process.exit(1);
}

const inputFileName = process.argv[2];

const jsonData = {};

createJSONs(inputFileName)

module.exports = {
  nestKeys,
  createJSONs
}