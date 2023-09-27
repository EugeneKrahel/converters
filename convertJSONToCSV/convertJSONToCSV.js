const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const directoryPath = './';

function getJsonFiles(directoryPath) {
  const jsonFilesToRead = []
  if (process.argv.length === 2) {
    jsonFilesToRead.push(...fs.readdirSync(directoryPath).filter((file) => file.endsWith('.json')))
  } else {
    jsonFilesToRead.push(...process.argv.slice(2))
  }
  return jsonFilesToRead;
}

const jsonFiles = getJsonFiles(directoryPath);

function flattenObject(ob, prefix = '') {
  const result = {};
  Object.keys(ob).forEach((key) => {
    const prop = `${prefix}${key}`;
    if (typeof ob[key] === 'object' && !Array.isArray(ob[key])) {
      Object.assign(result, flattenObject(ob[key], `${prop}.`));
    } else {
      result[prop] = ob[key];
    }
  });
  return result;
}

function mergeData(jsonFiles, flattenedData) {
  const mergedData = {};

  flattenedData.forEach((data, index) => {
    Object.keys(data).forEach((key) => {
      if (!mergedData[key]) {
        mergedData[key] = { key };
      }
      const fileName = jsonFiles[index].replace('.json', '');
      mergedData[key][fileName] = data[key];
    });
  });

  return mergedData;
}

const flattenedData = jsonFiles.map((jsonFile) => {
  const filePath = path.join(directoryPath, jsonFile);
  const rawData = JSON.parse(fs.readFileSync(filePath));
  return flattenObject(rawData);
});

const mergedData = mergeData(jsonFiles, flattenedData);

const csvData = Object.values(mergedData);

const currentDate = new Date().toISOString().slice(0, 10);

const csvFileName = `translations_${currentDate}.csv`;

const ws = XLSX.utils.json_to_sheet(csvData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

XLSX.writeFile(wb, csvFileName);

module.exports = {
  flattenObject,
  mergeData,
  getJsonFiles,
};
