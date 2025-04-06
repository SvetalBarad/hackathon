/**
 * Project File Cleanup Utility
 * 
 * This script identifies and optionally removes unnecessary files while maintaining
 * essential project structure. It follows the criteria defined in the project guidelines.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load configuration from file
let config;
try {
  const configPath = path.join(__dirname, 'cleanup-config.json');
  
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
    console.log('Configuration loaded from cleanup-config.json');
    
    // Convert string regex patterns to actual RegExp objects
    if (config.essentialPatterns && Array.isArray(config.essentialPatterns)) {
      config.essentialPatterns = config.essentialPatterns.map(pattern => new RegExp(pattern));
    }
  } else {
    console.warn('Configuration file not found, using default configuration');
    config = getDefaultConfig();
  }
} catch (err) {
  console.error('Error loading configuration:', err);
  console.log('Using default configuration');
  config = getDefaultConfig();
}

// Default configuration
function getDefaultConfig() {
  return {
    // Directories to clean
    directories: {
      frontend: 'src',     // Main frontend code is in src
      backend: 'backend',
      database: 'database', // This would be created if needed
      publicAssets: 'public',
    },
    
    // File patterns to always keep (regex patterns)
    essentialPatterns: [
      /^\.env/, // All env files (.env, .env.local, etc.)
      /config\.(js|ts|json)$/,
      /package(-lock)?\.json$/,
      /tsconfig.*\.json$/,
      /README\.md$/,
      /\.gitignore$/,
      /server\.js$/,
      /vite\.config\.ts$/,
      /tailwind\.config\.js$/,
      /postcss\.config\.js$/,
      /restart\.ps1$/
    ],
    
    // Directories that should never be deleted
    essentialDirectories: [
      'node_modules',
      'src',
      'backend',
      'public',
      'controllers',
      'models',
      'routes',
      'config',
      'components',
      'contexts',
      'pages',
      'services',
      'hooks',
      'utils',
      'lib',
    ],
    
    // File extensions that are typically build artifacts or temporary files
    artifactExtensions: [
      '.log',
      '.tmp',
      '.temp',
      '.DS_Store',
      '.bak',
      'Thumbs.db'
    ],
    
    // Days threshold for prompting before deletion
    accessThresholdDays: 30,
    
    // Backup directory for deleted files (relative to project root)
    backupDir: '.file-backup',
    
    // Days to keep backups before permanent deletion
    backupRetentionDays: 14,
    
    // Log file for deletion records
    logFile: 'cleanup-log.txt',
    
    // Additional options
    options: {
      promptBeforeDeletion: true,
      removeEmptyDirectories: true,
      removeEmptyFrontend: true,
      createBackups: true
    }
  };
}

// Utility functions
const utils = {
  // Check if a file is essential based on patterns
  isEssentialFile: (filePath) => {
    const fileName = path.basename(filePath);
    
    // Check against essential patterns
    return config.essentialPatterns.some(pattern => pattern.test(fileName));
  },
  
  // Check if a directory is essential
  isEssentialDirectory: (dirPath) => {
    const dirName = path.basename(dirPath);
    return config.essentialDirectories.includes(dirName);
  },
  
  // Check if file is a build artifact or temporary file
  isBuildArtifact: (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    return config.artifactExtensions.includes(ext);
  },
  
  // Check if file has been accessed recently
  isRecentlyAccessed: (filePath) => {
    try {
      const stats = fs.statSync(filePath);
      const lastAccessTime = new Date(stats.atime);
      const currentTime = new Date();
      const daysDifference = (currentTime - lastAccessTime) / (1000 * 60 * 60 * 24);
      
      return daysDifference < config.accessThresholdDays;
    } catch (err) {
      console.error(`Error checking access time for ${filePath}:`, err);
      // Default to true (recently accessed) in case of error
      return true;
    }
  },
  
  // Create a backup of a file before deleting
  backupFile: (filePath) => {
    if (!config.options.createBackups) {
      return null;
    }
    
    try {
      // Create backup directory if it doesn't exist
      const backupDir = path.join(process.cwd(), config.backupDir);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Create a subdirectory based on today's date
      const today = new Date().toISOString().split('T')[0];
      const dateDirPath = path.join(backupDir, today);
      if (!fs.existsSync(dateDirPath)) {
        fs.mkdirSync(dateDirPath, { recursive: true });
      }
      
      // Get relative path to maintain directory structure in backup
      const relativeFilePath = path.relative(process.cwd(), filePath);
      const backupFilePath = path.join(dateDirPath, relativeFilePath);
      
      // Create directory structure if needed
      const backupFileDir = path.dirname(backupFilePath);
      if (!fs.existsSync(backupFileDir)) {
        fs.mkdirSync(backupFileDir, { recursive: true });
      }
      
      // Copy the file to backup location
      fs.copyFileSync(filePath, backupFilePath);
      
      return backupFilePath;
    } catch (err) {
      console.error(`Error backing up ${filePath}:`, err);
      return null;
    }
  },
  
  // Log the deletion record
  logDeletion: (filePath, reason, backupPath = null) => {
    try {
      const logDir = path.dirname(config.logFile);
      if (!fs.existsSync(logDir) && logDir !== '.') {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logEntry = `${new Date().toISOString()} - DELETED: ${filePath} - REASON: ${reason}${
        backupPath ? ` - BACKUP: ${backupPath}` : ''
      }\n`;
      
      fs.appendFileSync(config.logFile, logEntry);
    } catch (err) {
      console.error('Error logging deletion:', err);
    }
  },
  
  // Clean up old backups
  cleanupOldBackups: () => {
    if (!config.options.createBackups) {
      return;
    }
    
    try {
      const backupDir = path.join(process.cwd(), config.backupDir);
      if (!fs.existsSync(backupDir)) return;
      
      const backupDates = fs.readdirSync(backupDir);
      const currentDate = new Date();
      
      backupDates.forEach(dateDir => {
        try {
          const backupDate = new Date(dateDir);
          if (isNaN(backupDate.getTime())) return; // Skip if not a valid date folder
          
          const daysDifference = (currentDate - backupDate) / (1000 * 60 * 60 * 24);
          
          if (daysDifference > config.backupRetentionDays) {
            const dateDirPath = path.join(backupDir, dateDir);
            fs.rmdirSync(dateDirPath, { recursive: true });
            console.log(`Removed old backup: ${dateDir}`);
          }
        } catch (err) {
          console.error(`Error processing backup directory ${dateDir}:`, err);
        }
      });
    } catch (err) {
      console.error('Error cleaning up old backups:', err);
    }
  },
  
  // Check if a directory is empty
  isEmptyDir: (dirPath) => {
    try {
      return fs.readdirSync(dirPath).length === 0;
    } catch (err) {
      console.error(`Error checking if directory is empty ${dirPath}:`, err);
      return false;
    }
  }
};

// Function to scan and clean a directory
function scanDirectory(dirPath, options = { dryRun: true }) {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory does not exist: ${dirPath}`);
      return;
    }
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Scan the subdirectory
        scanDirectory(itemPath, options);
        
        // Check if directory is empty after scanning and if we should remove empty dirs
        if (config.options.removeEmptyDirectories && 
            !utils.isEssentialDirectory(itemPath) && 
            utils.isEmptyDir(itemPath)) {
          handleDirectoryDeletion(itemPath, 'Empty directory', options);
        }
      } else if (stats.isFile()) {
        // For files, check if they should be deleted
        if (utils.isEssentialFile(itemPath)) {
          console.log(`Skipping essential file: ${itemPath}`);
        } else if (utils.isBuildArtifact(itemPath)) {
          handleFileDeletion(itemPath, 'Build artifact', options);
        } else if (!utils.isRecentlyAccessed(itemPath)) {
          // If file hasn't been accessed recently, prompt for deletion
          handleFileDeletion(itemPath, 'Not recently accessed', options);
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dirPath}:`, err);
  }
}

// Handle directory deletion with user confirmation
function handleDirectoryDeletion(dirPath, reason, options) {
  if (options.dryRun) {
    console.log(`Would delete directory (dry run): ${dirPath} - Reason: ${reason}`);
    return;
  }
  
  if (config.options.promptBeforeDeletion) {
    rl.question(`Delete directory "${dirPath}"? (Reason: ${reason}) [y/N]: `, (answer) => {
      if (answer.toLowerCase() === 'y') {
        deleteDirectory(dirPath, reason);
      } else {
        console.log(`Keeping directory: ${dirPath}`);
      }
    });
  } else {
    deleteDirectory(dirPath, reason);
  }
}

// Helper to delete directory
function deleteDirectory(dirPath, reason) {
  try {
    fs.rmdirSync(dirPath);
    utils.logDeletion(dirPath, reason, null);
    console.log(`Deleted directory: ${dirPath}`);
  } catch (err) {
    console.error(`Error deleting directory ${dirPath}:`, err);
  }
}

// Handle file deletion with user confirmation
function handleFileDeletion(filePath, reason, options) {
  if (options.dryRun) {
    console.log(`Would delete (dry run): ${filePath} - Reason: ${reason}`);
    return;
  }
  
  if (config.options.promptBeforeDeletion) {
    rl.question(`Delete file "${filePath}"? (Reason: ${reason}) [y/N]: `, (answer) => {
      if (answer.toLowerCase() === 'y') {
        deleteFile(filePath, reason);
      } else {
        console.log(`Keeping file: ${filePath}`);
      }
    });
  } else {
    deleteFile(filePath, reason);
  }
}

// Helper to delete file
function deleteFile(filePath, reason) {
  console.log(`Deleting file: ${filePath}`);
  
  // Create backup before deleting
  const backupPath = utils.backupFile(filePath);
  
  try {
    fs.unlinkSync(filePath);
    utils.logDeletion(filePath, reason, backupPath);
    console.log(`Deleted file: ${filePath}`);
    if (backupPath) {
      console.log(`Backup created at: ${backupPath}`);
    }
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
  }
}

// Main function to run the cleanup
function runCleanup(options = { dryRun: true }) {
  console.log(`Starting project cleanup${options.dryRun ? ' (DRY RUN)' : ''}...`);
  
  // Check and clean up essential directories
  Object.values(config.directories).forEach(dir => {
    console.log(`Scanning directory: ${dir}`);
    scanDirectory(dir, options);
  });
  
  // Special handling for the empty frontend directory
  if (config.options.removeEmptyFrontend) {
    try {
      const frontendDir = 'frontend';
      if (fs.existsSync(frontendDir) && utils.isEmptyDir(frontendDir)) {
        if (options.dryRun) {
          console.log(`Would delete empty frontend directory: ${frontendDir} (dry run)`);
        } else {
          handleDirectoryDeletion(frontendDir, 'Empty directory', options);
        }
      }
    } catch (err) {
      console.error('Error handling frontend directory:', err);
    }
  }
  
  // Clean up old backups
  utils.cleanupOldBackups();
  
  if (options.dryRun) {
    console.log("\nThis was a dry run. No files were actually deleted.");
    console.log("Run with --delete flag to perform actual deletions.");
    rl.close();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: !args.includes('--delete')
};

// Run the cleanup
runCleanup(options);

// Listen for close event to exit
rl.on('close', () => {
  console.log('Cleanup completed!');
  process.exit(0);
});

// Allow closing the app gracefully
process.on('SIGINT', () => {
  console.log('\nCleanup aborted by user');
  rl.close();
}); 