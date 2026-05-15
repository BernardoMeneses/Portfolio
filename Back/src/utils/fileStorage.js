import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Read JSON file from data directory
 * @param {string} filename - Name of the JSON file
 * @returns {any} Parsed JSON data
 */
export function readJsonFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    // Return empty array for arrays, empty object for objects
    return filename.includes('projects') || filename.includes('recommendations') ? [] : {};
  }
}

/**
 * Write JSON file to data directory
 * @param {string} filename - Name of the JSON file
 * @param {any} data - Data to write
 */
export function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

/**
 * Add item to JSON array file
 * @param {string} filename - Name of the JSON file
 * @param {any} item - Item to add
 * @returns {any} The added item with id
 */
export function addItemToFile(filename, item) {
  try {
    let data = readJsonFile(filename);
    if (!Array.isArray(data)) {
      data = [];
    }
    
    // Add id and timestamp
    const newItem = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...item
    };
    
    data.unshift(newItem); // Add to beginning
    writeJsonFile(filename, data);
    return newItem;
  } catch (error) {
    console.error(`Error adding to ${filename}:`, error);
    throw error;
  }
}

export default {
  readJsonFile,
  writeJsonFile,
  addItemToFile
};
