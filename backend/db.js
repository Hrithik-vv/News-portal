import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

// Helper to read database
export function readDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { users: [], news: [] };
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const data = JSON.parse(raw);

    // Self-healing: hash plain passwords at startup
    let updated = false;
    if (data.users && Array.isArray(data.users)) {
      data.users = data.users.map(u => {
        if (u.password && !u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
          const salt = bcrypt.genSaltSync(10);
          u.password = bcrypt.hashSync(u.password, salt);
          updated = true;
          console.log(`[Database] Hashed plain password for admin user: ${u.email}`);
        }
        return u;
      });
    }

    if (updated) {
      writeDatabase(data);
    }

    return data;
  } catch (error) {
    console.error('Error reading JSON database:', error);
    return { users: [], news: [] };
  }
}

// Helper to write database
export function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to JSON database:', error);
    return false;
  }
}

// Initialize database reading on load
readDatabase();
