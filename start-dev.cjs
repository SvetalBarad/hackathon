/**
 * Development Server Launcher
 * This script starts both the frontend and backend servers in development mode.
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const colors = require('colors');
const fs = require('fs');

// Configuration
const CONFIG = {
  backend: {
    dir: path.resolve(__dirname, 'backend'),
    command: 'node',
    args: ['server.js'],
    envFile: path.resolve(__dirname, 'backend', '.env'),
    port: process.env.BACKEND_PORT || 3001,
    readyMessage: 'Server running',
  },
  frontend: {
    command: 'npm',
    args: ['run', 'dev'],
    port: process.env.FRONTEND_PORT || 5173,
    readyMessage: 'Local:',
  },
  maxStartTimeSeconds: 30, // Maximum time to wait for a service to start
};

// Check if .env files exist
const checkEnvFiles = () => {
  const backendEnvExists = fs.existsSync(CONFIG.backend.envFile);
  const rootEnvExists = fs.existsSync(path.resolve(__dirname, '.env'));
  
  if (!backendEnvExists) {
    console.log('⚠️  Backend .env file not found!'.yellow);
    console.log(`Create it at: ${CONFIG.backend.envFile}`.cyan);
  }
  
  if (!rootEnvExists) {
    console.log('⚠️  Root .env file not found!'.yellow);
    console.log(`Create it at: ${path.resolve(__dirname, '.env')}`.cyan);
  }
  
  return backendEnvExists && rootEnvExists;
};

// Kill processes on specified ports
const killProcessOnPort = (port) => {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      exec(`FOR /F "tokens=5" %a in ('netstat -ano ^| find "LISTENING" ^| find "${port}"') do taskkill /F /PID %a`, (error) => {
        resolve();
      });
    } else {
      exec(`lsof -i tcp:${port} | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true`, (error) => {
        resolve();
      });
    }
  });
};

// Start a service and return its process
const startService = (name, command, args, cwd = null, readyMessage) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Starting ${name}...`.cyan);
    
    const options = {
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: true },
      shell: true
    };
    
    if (cwd) {
      options.cwd = cwd;
    }
    
    const proc = spawn(command, args, options);
    
    let ready = false;
    let output = '';
    
    // Set a timeout for service startup
    const timeout = setTimeout(() => {
      if (!ready) {
        console.error(`❌ ${name} did not start within ${CONFIG.maxStartTimeSeconds} seconds.`.red);
        console.error(`Last output: ${output}`.gray);
        reject(new Error(`${name} startup timeout`));
      }
    }, CONFIG.maxStartTimeSeconds * 1000);
    
    // Handle process output
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      output = text;
      console.log(`[${name}] `.green + text.trim());
      
      if (text.includes(readyMessage) && !ready) {
        ready = true;
        clearTimeout(timeout);
        console.log(`✅ ${name} is ready!`.green);
        resolve(proc);
      }
    });
    
    proc.stderr.on('data', (data) => {
      const text = data.toString();
      output = text;
      console.error(`[${name}] `.red + text.trim());
    });
    
    proc.on('error', (error) => {
      console.error(`❌ Failed to start ${name}: ${error}`.red);
      clearTimeout(timeout);
      reject(error);
    });
    
    proc.on('close', (code) => {
      if (code !== 0 && !ready) {
        console.error(`❌ ${name} exited with code ${code}`.red);
        clearTimeout(timeout);
        reject(new Error(`${name} exited with code ${code}`));
      }
    });
  });
};

// Main function to start all services
const startAll = async () => {
  try {
    console.log('\n🔍 Starting development environment...'.cyan.bold);
    
    // Kill any existing processes on the ports we need
    console.log('\n🔄 Ensuring ports are available...'.cyan);
    await killProcessOnPort(CONFIG.backend.port);
    await killProcessOnPort(CONFIG.frontend.port);
    
    // Check environment files
    checkEnvFiles();
    
    // Start backend server
    const backendProcess = await startService(
      'Backend API',
      CONFIG.backend.command,
      CONFIG.backend.args,
      CONFIG.backend.dir,
      CONFIG.backend.readyMessage
    );
    
    // Start frontend development server
    const frontendProcess = await startService(
      'Frontend',
      CONFIG.frontend.command,
      CONFIG.frontend.args,
      process.cwd(),
      CONFIG.frontend.readyMessage
    );
    
    console.log('\n✅ Development environment is ready!'.green.bold);
    console.log('\n📋 Access points:'.cyan);
    console.log(`  • Backend API: ${'http://localhost:'.gray}${String(CONFIG.backend.port).cyan}`);
    console.log(`  • Frontend:    ${'http://localhost:'.gray}${String(CONFIG.frontend.port).cyan}`);
    
    // Handle termination signals
    const cleanup = () => {
      console.log('\n🛑 Shutting down development environment...'.yellow);
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
  } catch (error) {
    console.error(`\n❌ Failed to start development environment: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Start everything
startAll(); 