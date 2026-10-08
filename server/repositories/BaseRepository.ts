import fs from 'fs/promises';
import path from 'path';

export class Mutex {
  private mutex = Promise.resolve();

  lock(): Promise<() => void> {
    let begin: (unlock: () => void) => void = () => {};
    this.mutex = this.mutex.then(() => {
      return new Promise(begin);
    });
    return new Promise((res) => {
      begin = res;
    });
  }
}

export class BaseRepository<T extends { id: string }> {
  protected filePath: string;
  protected mutex: Mutex;

  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
    // Use /tmp for serverless environments (Netlify/AWS Lambda) because the normal filesystem is read-only
    const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
    const baseDir = isServerless ? '/tmp/server/data' : path.join(process.cwd(), 'server', 'data');
    this.filePath = path.join(baseDir, filename);
    this.mutex = new Mutex();
    this.initFile();
  }

  private async initFile() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      
      const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
      let seeded = false;
      
      if (isServerless) {
        try {
          const sourcePath = path.join(process.cwd(), 'server', 'data', this.filename);
          await fs.copyFile(sourcePath, this.filePath);
          seeded = true;
        } catch (e) {
          // Source file doesn't exist, ignore
        }
      }

      if (!seeded) {
        await fs.writeFile(this.filePath, JSON.stringify([]));
      }
    }
  }

  private async createBackup() {
    try {
      const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
      const backupDir = isServerless 
        ? path.join('/tmp/server/data', 'backups')
        : path.join(process.cwd(), 'server', 'data', 'backups');
        
      await fs.mkdir(backupDir, { recursive: true });
      const backupPath = path.join(backupDir, `${path.basename(this.filePath)}-${Date.now()}.json`);
      await fs.copyFile(this.filePath, backupPath);
    } catch (e) {
      console.error('Failed to create backup:', e);
    }
  }

  async readAll(): Promise<T[]> {
    const unlock = await this.mutex.lock();
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    } finally {
      unlock();
    }
  }

  async writeAll(data: T[]): Promise<void> {
    const unlock = await this.mutex.lock();
    try {
      await this.createBackup();
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    } finally {
      unlock();
    }
  }

  async findById(id: string): Promise<T | null> {
    const items = await this.readAll();
    return items.find((item) => item.id === id) || null;
  }

  async create(item: T): Promise<T> {
    const items = await this.readAll();
    items.push(item);
    await this.writeAll(items);
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const items = await this.readAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    await this.writeAll(items);
    return items[index];
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.readAll();
    const initialLength = items.length;
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length !== initialLength) {
      await this.writeAll(filtered);
      return true;
    }
    return false;
  }
}
