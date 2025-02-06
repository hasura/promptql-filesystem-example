import * as fs from 'fs/promises';
import * as path from 'path';

interface CommandResult {
  success: boolean;
  code: number;
  message?: string;
}

interface CommandResultWithData extends CommandResult {
  result?: string;
}

/**
 * @readonly List contents of a directory by running the bash ls command
 * @param dirPath - Path to directory
 * @param options - Optional settings for listing
 * @returns Promise with command result containing directory entries
 */
export async function ls(
  dirPath: string,
  options: { all?: boolean; long?: boolean } = {}
): Promise<CommandResultWithData> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    // Filter hidden files unless -a/--all flag is set
    let filtered = options.all
      ? entries
      : entries.filter(entry => !entry.name.startsWith('.'));

    if (options.long) {
      // For long format, get detailed stats for each entry
      const details = await Promise.all(
        filtered.map(async (entry) => {
          const stats = await fs.stat(path.join(dirPath, entry.name));
          const type = entry.isDirectory() ? 'd' : '-';
          const size = stats.size;
          const mtime = stats.mtime.toISOString();
          return `${type} ${size.toString().padStart(8)} ${mtime} ${entry.name}`;
        })
      );
      return {
        success: true,
        code: 0,
        result: details.join('\n')
      };
    }

    const fileList = filtered.map(entry =>
      entry.isDirectory() ? `${entry.name}/` : entry.name
    );
    
    return {
      success: true,
      code: 0,
      result: fileList.join('\n')
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      code: 1,
      message: `Failed to list directory ${dirPath}: ${message}`
    };
  }
}

/**
 * Write content to a file (equivalent to "cat > file" in bash)
 * @param filePath - Path to file
 * @param content - Content to write
 * @param options - Write options
 */
export async function writeFile(
  filePath: string,
  content: string | Buffer,
  options: { append?: boolean } = {}
): Promise<CommandResult> {
  try {
    const flag = options.append ? 'a' : 'w';
    await fs.writeFile(filePath, content, { flag });
    return { success: true, code: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      code: 1,
      message: `Failed to write to ${filePath}: ${message}`
    };
  }
}

/**
 * @readonly Read content from a file (equivalent to "cat file" in bash)
 * @param filePath - Path to file
 * @returns Promise with command result containing file content
 */
export async function cat(filePath: string): Promise<CommandResultWithData> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return {
      success: true,
      code: 0,
      result: content
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      code: 1,
      message: `Failed to read ${filePath}: ${message}`
    };
  }
}

/**
 * Remove a file by running the bash rm command
 * @param filePath - Path to file
 * @param options - Remove options
 */
export async function rm(
  filePath: string,
  options: { force?: boolean; recursive?: boolean } = {}
): Promise<CommandResult> {
  try {
    if (options.recursive) {
      await fs.rm(filePath, { recursive: true, force: options.force });
    } else {
      await fs.unlink(filePath);
    }
    return { success: true, code: 0 };
  } catch (error) {
    if (options.force) {
      return { success: true, code: 0 };
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      code: 1,
      message: `Failed to remove ${filePath}: ${message}`
    };
  }
}

/**
 * Remove a directory by running the bash rmdir command
 * @param dirPath - Path to directory
 * @param options - Remove options
 */
export async function rmdir(
  dirPath: string,
  options: { recursive?: boolean; force?: boolean } = {}
): Promise<CommandResult> {
  try {
    await fs.rm(dirPath, {
      recursive: options.recursive,
      force: options.force
    });
    return { success: true, code: 0 };
  } catch (error) {
    if (options.force) {
      return { success: true, code: 0 };
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      code: 1,
      message: `Failed to remove directory ${dirPath}: ${message}`
    };
  }
}

/**
 * Create a directory by running the bash mkdir command
 * @param dirPath - Path to directory
 * @param options - Directory creation options
 */
export async function mkdir(
  dirPath: string,
  options: { parents?: boolean } = {}
): Promise<CommandResult> {
  try {
    await fs.mkdir(dirPath, {
      recursive: options.parents
    });
    return { success: true, code: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      code: 1,
      message: `Failed to create directory ${dirPath}: ${message}`
    };
  }
}

/**
 * Copy a file or directory by running the bash cp command
 * @param src - Source path
 * @param dest - Destination path
 * @param options - Copy options
 */
export async function cp(
  src: string,
  dest: string,
  options: { recursive?: boolean } = {}
): Promise<CommandResult> {
  try {
    await fs.cp(src, dest, {
      recursive: options.recursive,
      force: false
    });
    return { success: true, code: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      code: 1,
      message: `Failed to copy ${src} to ${dest}: ${message}`
    };
  }
}

/**
 * Move/rename a file or directory by running the bash mv command
 * @param src - Source path
 * @param dest - Destination path
 */
export async function mv(src: string, dest: string): Promise<CommandResult> {
  try {
    await fs.rename(src, dest);
    return { success: true, code: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      code: 1,
      message: `Failed to move ${src} to ${dest}: ${message}`
    };
  }
}
