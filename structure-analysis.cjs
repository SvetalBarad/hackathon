/**
 * Project Structure Analysis Tool
 * 
 * This script analyzes the project structure and reports on:
 * - Directory sizes
 * - File types and counts
 * - Potential duplicate files
 * - Common naming pattern violations
 * - Recommended files to review
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('Starting structure analysis...');

// Configuration
let config;
try {
  const configPath = path.join(__dirname, 'cleanup-config.json');
  console.log(`Looking for config at: ${configPath}`);
  
  if (fs.existsSync(configPath)) {
    console.log('Config file exists, loading...');
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
    console.log('Configuration loaded from cleanup-config.json');
  } else {
    console.log('Config file not found, using defaults');
    config = {
      directories: {
        frontend: 'src',
        backend: 'backend',
        database: 'database',
        publicAssets: 'public'
      },
      essentialDirectories: [
        'node_modules',
        'src',
        'backend',
        'public'
      ]
    };
  }
  console.log('Config loaded:', JSON.stringify(config, null, 2));
} catch (err) {
  console.error('Error loading configuration:', err);
  process.exit(1);
}

// Analysis data structure
const analysis = {
  directoryStats: {},
  fileTypes: {},
  potentialDuplicates: [],
  namingIssues: [],
  unusedFiles: [],
  largeFiles: []
};

// File hashes for detecting duplicates
const fileHashes = {};

// Utility functions
const utils = {
  // Convert file size to human-readable format
  formatSize: (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },
  
  // Check file naming conventions
  checkNamingConvention: (filePath) => {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath, ext);
    
    const issues = [];
    
    // React component files should use PascalCase
    if ((ext === '.jsx' || ext === '.tsx') && 
        filePath.includes('/components/') && 
        !/^[A-Z][A-Za-z0-9]*$/.test(baseName)) {
      issues.push(`Component file '${fileName}' should use PascalCase`);
    }
    
    // Utility files should use camelCase
    if ((ext === '.js' || ext === '.ts') && 
        (filePath.includes('/utils/') || filePath.includes('/hooks/')) && 
        !/^[a-z][A-Za-z0-9]*$/.test(baseName)) {
      issues.push(`Utility file '${fileName}' should use camelCase`);
    }
    
    // CSS/SCSS files should use kebab-case
    if ((ext === '.css' || ext === '.scss') && 
        !/^[a-z][a-z0-9-]*$/.test(baseName)) {
      issues.push(`CSS file '${fileName}' should use kebab-case`);
    }
    
    return issues;
  },
  
  // Calculate file hash for duplicate detection
  calculateFileHash: (filePath) => {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      return hashSum.digest('hex');
    } catch (err) {
      console.error(`Error calculating hash for ${filePath}:`, err);
      return null;
    }
  },
  
  // Check for potential unused files
  isLikelyUnused: (filePath) => {
    try {
      const stats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      // Skip node_modules and essential files
      if (filePath.includes('node_modules') || 
          /package(-lock)?\.json$/.test(fileName) ||
          /tsconfig.*\.json$/.test(fileName) ||
          /README\.md$/.test(fileName)) {
        return false;
      }
      
      // Consider file unused if not accessed in 90 days (3x the cleanup threshold)
      const lastAccessTime = new Date(stats.atime);
      const currentTime = new Date();
      const daysDifference = (currentTime - lastAccessTime) / (1000 * 60 * 60 * 24);
      
      return daysDifference > 90;
    } catch (err) {
      console.error(`Error checking if file is unused ${filePath}:`, err);
      return false;
    }
  },
  
  // Check if a file is large enough to be notable
  isLargeFile: (filePath) => {
    try {
      const stats = fs.statSync(filePath);
      return stats.size > 1024 * 1024; // Larger than 1MB
    } catch (err) {
      console.error(`Error checking file size ${filePath}:`, err);
      return false;
    }
  }
};

// Analyze directory
function analyzeDirectory(dirPath, relativePath = '') {
  try {
    console.log(`Analyzing directory: ${dirPath}`);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory does not exist: ${dirPath}`);
      return { size: 0, files: 0, directories: 0 };
    }
    
    const items = fs.readdirSync(dirPath);
    let stats = { size: 0, files: 0, directories: 0 };
    
    console.log(`Found ${items.length} items in ${dirPath}`);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const itemRelPath = path.join(relativePath, item);
      
      try {
        const itemStats = fs.statSync(itemPath);
        
        if (itemStats.isDirectory()) {
          // Skip node_modules for performance
          if (item === 'node_modules') {
            stats.directories += 1;
            stats.size += itemStats.size;
            console.log(`Skipping node_modules directory: ${itemPath}`);
            continue;
          }
          
          console.log(`Processing directory: ${itemPath}`);
          const dirStats = analyzeDirectory(itemPath, itemRelPath);
          stats.size += dirStats.size;
          stats.files += dirStats.files;
          stats.directories += dirStats.directories + 1;
        } else if (itemStats.isFile()) {
          stats.files += 1;
          stats.size += itemStats.size;
          
          if (stats.files % 100 === 0) {
            console.log(`Processed ${stats.files} files so far...`);
          }
          
          // Track file types
          const ext = path.extname(item).toLowerCase() || 'no-extension';
          analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1;
          
          // Check naming conventions
          const namingIssues = utils.checkNamingConvention(itemPath);
          if (namingIssues.length > 0) {
            analysis.namingIssues.push(...namingIssues.map(issue => ({ file: itemRelPath, issue })));
          }
          
          // Check for large files
          if (utils.isLargeFile(itemPath)) {
            analysis.largeFiles.push({
              file: itemRelPath,
              size: utils.formatSize(itemStats.size)
            });
          }
          
          // Check for potential duplicates
          const fileHash = utils.calculateFileHash(itemPath);
          if (fileHash) {
            if (fileHashes[fileHash]) {
              // Avoid adding the same file twice
              if (!analysis.potentialDuplicates.some(dup => 
                  dup.hash === fileHash && 
                  dup.files.includes(fileHashes[fileHash]) && 
                  dup.files.includes(itemRelPath))) {
                analysis.potentialDuplicates.push({
                  hash: fileHash,
                  files: [fileHashes[fileHash], itemRelPath]
                });
              }
            } else {
              fileHashes[fileHash] = itemRelPath;
            }
          }
          
          // Check for potentially unused files
          if (utils.isLikelyUnused(itemPath)) {
            analysis.unusedFiles.push({
              file: itemRelPath,
              lastAccessed: fs.statSync(itemPath).atime
            });
          }
        }
      } catch (err) {
        console.error(`Error processing item ${itemPath}:`, err);
      }
    }
    
    // Store stats for this directory
    analysis.directoryStats[relativePath || 'root'] = {
      size: utils.formatSize(stats.size),
      files: stats.files,
      directories: stats.directories
    };
    
    console.log(`Finished analyzing ${dirPath}: ${stats.files} files, ${stats.directories} directories`);
    return stats;
    
  } catch (err) {
    console.error(`Error analyzing directory ${dirPath}:`, err);
    return { size: 0, files: 0, directories: 0 };
  }
}

// Generate report
function generateReport() {
  console.log('\n=============== PROJECT STRUCTURE ANALYSIS ===============\n');
  
  // Directory statistics
  console.log('DIRECTORY STATISTICS:');
  console.log('--------------------');
  Object.keys(analysis.directoryStats).sort().forEach(dir => {
    const stats = analysis.directoryStats[dir];
    console.log(`${dir}: ${stats.files} files, ${stats.directories} directories, ${stats.size}`);
  });
  
  // File types breakdown
  console.log('\nFILE TYPES:');
  console.log('-----------');
  const sortedTypes = Object.entries(analysis.fileTypes)
    .sort((a, b) => b[1] - a[1]);
  
  sortedTypes.forEach(([type, count]) => {
    console.log(`${type}: ${count} files`);
  });
  
  // Potential duplicates
  if (analysis.potentialDuplicates.length > 0) {
    console.log('\nPOTENTIAL DUPLICATE FILES:');
    console.log('-------------------------');
    analysis.potentialDuplicates.forEach(dup => {
      console.log(`Duplicate set:`);
      dup.files.forEach(file => console.log(`  - ${file}`));
    });
  }
  
  // Naming issues
  if (analysis.namingIssues.length > 0) {
    console.log('\nNAMING CONVENTION ISSUES:');
    console.log('------------------------');
    analysis.namingIssues.forEach(issue => {
      console.log(`${issue.file}: ${issue.issue}`);
    });
  }
  
  // Potentially unused files
  if (analysis.unusedFiles.length > 0) {
    console.log('\nPOTENTIALLY UNUSED FILES:');
    console.log('------------------------');
    analysis.unusedFiles.forEach(file => {
      console.log(`${file.file} (Last accessed: ${file.lastAccessed.toISOString().split('T')[0]})`);
    });
  }
  
  // Large files
  if (analysis.largeFiles.length > 0) {
    console.log('\nLARGE FILES:');
    console.log('------------');
    analysis.largeFiles.forEach(file => {
      console.log(`${file.file} (${file.size})`);
    });
  }
  
  console.log('\n=========================================================\n');
}

// Main function
function main() {
  console.log('Starting main analysis function...');
  
  // Analyze directories from config
  Object.entries(config.directories).forEach(([key, dirPath]) => {
    if (fs.existsSync(dirPath)) {
      console.log(`Analyzing ${key} directory: ${dirPath}`);
      analyzeDirectory(dirPath, dirPath);
    } else {
      console.log(`Directory does not exist: ${dirPath}`);
    }
  });
  
  console.log('Analysis complete, generating report...');
  
  // Generate report
  generateReport();
  
  console.log('Done!');
}

// Run the analysis
main(); 