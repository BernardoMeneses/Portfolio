import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEFAULT_DATA_DIR = path.join(__dirname, '../data');
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : DEFAULT_DATA_DIR;

export class StorageWriteError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'StorageWriteError';
    this.status = options.status || 503;
    this.code = options.code || 'STORAGE_WRITE_UNAVAILABLE';
    this.cause = options.cause;
  }
}

const isReadOnlyStorageError = (error) =>
  ['EROFS', 'EACCES', 'EPERM'].includes(error?.code);

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (error) {
  console.warn(`Storage directory setup warning for ${DATA_DIR}:`, error.message);
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

    if (isReadOnlyStorageError(error)) {
      throw new StorageWriteError(
        'Este deploy do backend esta em armazenamento read-only. No Vercel nao da para guardar alteracoes em ficheiros JSON locais.',
        { cause: error, code: 'READ_ONLY_FILESYSTEM' }
      );
    }

    throw new StorageWriteError(
      `Nao foi possivel guardar ${filename}.`,
      { cause: error }
    );
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

    const newItem = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...item
    };

    data.unshift(newItem);
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
