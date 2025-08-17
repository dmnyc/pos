// update-version.js
const fs = require('fs');
const path = require('path');

// Read the version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

// Create a new version.json with updated build date
const versionJson = {
  version,
  buildDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
};

// Write to version.json
fs.writeFileSync(
  path.resolve(__dirname, '../public/version.json'), 
  JSON.stringify(versionJson, null, 2)
);

console.log(`Updated version.json to version ${version} with today's build date.`);