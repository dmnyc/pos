// update-version.js
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the current module's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

// Get Git commit hash as build number
let buildNumber;
try {
  // Get short commit hash
  const gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
  
  // Get commit count for this branch (optional, adds a numeric component)
  const gitCommitCount = execSync('git rev-list --count HEAD').toString().trim();
  
  buildNumber = `${gitCommitCount}-${gitCommitHash}`;
} catch (error) {
  console.warn('Unable to get Git information, using timestamp as build number');
  buildNumber = Date.now().toString();
}

// Create a new version.json with updated build date and build number
const versionJson = {
  version,
  buildNumber,
  buildDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
};

// Write to version.json
const outputDir = resolve(__dirname, '../public');
try {
  writeFileSync(
    resolve(outputDir, 'version.json'), 
    JSON.stringify(versionJson, null, 2)
  );
  console.log(`Updated version.json to version ${version} (build ${buildNumber}) with today's build date.`);
} catch (error) {
  console.error('Error writing version.json:', error);
}