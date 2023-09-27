const fs = require('fs');
const csv = require('csv-parser');

function nestKeys(current, keys, value) {
  const key = keys.shift();
  if (keys.length === 0) {
    if(value) {
      current[key] = value;
    }
  } else {
    current[key] = current[key] || {};
    nestKeys(current[key], keys, value);
  }
}

if (process.argv.length !== 3) {
  console.error('Usage: node convertCSVToJSON.js <input-csv-file>');
  process.exit(1);
}

const inputFileName = process.argv[2];

const jsonData = {};

fs.createReadStream(inputFileName)
  .pipe(csv())
  .on('data', (row) => {
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
  })
  .on('end', () => {
    for (const lang in jsonData) {
      const outputFile = `${lang}.json`;

      fs.writeFileSync(outputFile, JSON.stringify(jsonData[lang], null, 2));
    }
  });
