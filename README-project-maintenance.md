# Project Maintenance Guide

This document provides guidelines and instructions for maintaining a clean and efficient project structure. It includes information on how to organize files and use the automated tools to keep the codebase clean.

## Project Organization

The project is organized into the following main directories:

- **src/** - Contains the frontend codebase (React/Vite application)
  - components/ - UI components
  - contexts/ - React context providers
  - pages/ - Page components
  - services/ - API services
  - hooks/ - Custom React hooks
  - utils/ - Utility functions
  - lib/ - External libraries or adaptations

- **backend/** - Contains the server-side codebase (Node.js/Express)
  - routes/ - API route definitions
  - models/ - Database models
  - controllers/ - Request handlers
  - config/ - Configuration files
  - scripts/ - Utility scripts

- **public/** - Static assets for the frontend

## File Organization Guidelines

Follow these guidelines to maintain a clean and efficient codebase:

1. **Naming Conventions**
   - Use consistent naming patterns (camelCase for JavaScript/TypeScript files, kebab-case for CSS)
   - Name components using PascalCase (e.g., `UserProfile.tsx`)
   - Name utilities and hooks using camelCase (e.g., `useAuth.ts`, `formatDate.ts`)

2. **File Placement**
   - Always place files in the appropriate directories based on their function
   - Group related files together
   - Create subdirectories for feature-based organization when appropriate

3. **Import Organization**
   - Group imports by type (React, third-party, local components, styles)
   - Use relative paths for imports within the same feature
   - Use absolute paths (from src/) for cross-feature imports

4. **Documentation**
   - Include JSDoc comments for functions and components
   - Update README files when adding new features
   - Document API endpoints in backend routes

## Automated Cleanup Tools

This project includes tools to help maintain a clean codebase by identifying and removing unnecessary files.

### Project Cleanup Utility

The `project-cleanup.js` script helps identify and optionally remove:
- Temporary files
- Build artifacts
- Unused files
- Empty directories

#### Running the Cleanup Utility

To run the cleanup utility:

```bash
# Dry run (will not delete files, just report)
node project-cleanup.js

# Actual deletion (will prompt for confirmation)
node project-cleanup.js --delete
```

#### Scheduled Cleanup

To schedule regular cleanup using the PowerShell script:

```powershell
# Run once to set up the scheduled task
.\schedule-cleanup.ps1
```

This will create a Windows scheduled task to run the cleanup weekly.

### Cleanup Options and Configuration

You can customize the cleanup behavior by modifying the configuration in `project-cleanup.js`:

- **Essential Patterns**: Regex patterns for files that should never be deleted
- **Essential Directories**: Directories that should never be removed
- **Artifact Extensions**: File extensions that are typically build artifacts
- **Access Threshold**: Number of days after which unused files are suggested for deletion
- **Backup Retention**: Number of days to keep backups of deleted files

## Manual Cleanup Guidelines

In addition to automated tools, periodically review:

1. **Dependencies**
   - Remove unused npm packages
   - Update outdated dependencies

2. **Dead Code**
   - Remove commented-out code
   - Delete unused functions and components

3. **Configuration Files**
   - Consolidate duplicate configuration settings
   - Remove obsolete environment variables

4. **Build Artifacts**
   - Clean build directories before committing
   - Add temporary build folders to .gitignore

## Backup and Recovery

Before major cleanups:

1. Commit all current changes to version control
2. The cleanup tool automatically creates backups in `.file-backup/` directory
3. Backups are organized by date
4. Recovery from backup can be done by copying files from the backup directory

## Best Practices

- Run the cleanup utility in dry-run mode first to review suggested deletions
- Schedule regular cleanup sessions to maintain code hygiene
- Use version control to track all significant changes
- When in doubt about a file's purpose, consult with the team before deletion

## Setting Up a New Environment

When setting up a new development environment:

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Install the cleanup utility as a scheduled task if desired

---

By following these guidelines and using the provided tools, we can maintain a clean, efficient, and well-organized codebase that is easier to navigate and develop against. 