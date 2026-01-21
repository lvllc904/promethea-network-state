#!/usr/bin/env node
/**
 * Symbiotic Memory System Manager
 * Universal manager for starting/stopping/monitoring the daemon
 */
import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';

class SymbioticMemoryManager {
  constructor() {
    this.daemonProcess = null;
    this.pidFile = './symbiotic-memory-daemon.pid';
    this.logFile = './symbiotic-memory.log';
    this.healthCheckPort = process.env.SMD_PORT || 6000;
  }

  async start() {
    if (await this.isRunning()) {
      console.log('✅ Symbiotic Memory Daemon already running');
      return;
    }
    console.log('🚀 Starting Symbiotic Memory System...');
    
    const logFileDescriptor = fs.openSync(this.logFile, 'a');
    
    this.daemonProcess = spawn('node', ['symbiotic-memory-daemon.js'], {
      stdio: ['ignore', logFileDescriptor, logFileDescriptor],
      detached: true
    });
    this.daemonProcess.unref();
    // Save PID
    fs.writeFileSync(this.pidFile, this.daemonProcess.pid.toString());
    // Wait for startup
    await this.waitForStartup();
    
    console.log(`✅ Symbiotic Memory Daemon started on port ${this.healthCheckPort}`);
    console.log(`📋 PID: ${this.daemonProcess.pid}`);
    console.log(`📄 Logs: ${this.logFile}`);
  }

  async stop() {
    if (!await this.isRunning()) {
      console.log('❌ Symbiotic Memory Daemon not running');
      return;
    }
    const pid = this.getPid();
    if (pid) {
      try {
        process.kill(pid, 'SIGTERM');
        fs.unlinkSync(this.pidFile);
        console.log('🛑 Symbiotic Memory Daemon stopped');
      } catch (error) {
        console.error('Error stopping daemon:', error.message);
      }
    }
  }

  async status() {
    const running = await this.isRunning();
    const pid = this.getPid();
    
    console.log(`Status: ${running ? '✅ Running' : '❌ Stopped'}`);
    if (running && pid) {
      console.log(`PID: ${pid}`);
      
      try {
        const health = await this.checkHealth();
        console.log('Health:', health.status);
        console.log('Uptime:', Math.round(health.uptime), 'seconds');
        console.log('Patterns Learned:', health.patternsLearned);
        console.log('Architectural Changes:', health.architecturalChanges);
        console.log('Security Events:', health.securityEvents);
      } catch (error) {
        console.log('Health check failed:', error.message);
      }
    }
  }

  async restart() {
    console.log('🔄 Restarting Symbiotic Memory Daemon...');
    await this.stop();
    setTimeout(() => this.start(), 2000);
  }

  getPid() {
    try {
      return parseInt(fs.readFileSync(this.pidFile, 'utf8'));
    } catch {
      return null;
    }
  }

  async isRunning() {
    const pid = this.getPid();
    if (!pid) return false;
    try {
      process.kill(pid, 0);
      return await this.checkHealth().then(() => true).catch(() => false);
    } catch {
      return false;
    }
  }

  async checkHealth() {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${this.healthCheckPort}/health`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.abort();
        reject(new Error('Health check timeout'));
      });
    });
  }

  async waitForStartup() {
    for (let i = 0; i < 10; i++) {
      try {
        await this.checkHealth();
        return;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Daemon failed to start within 10 seconds');
  }

  async logs() {
    if (fs.existsSync(this.logFile)) {
      const logs = fs.readFileSync(this.logFile, 'utf8');
      console.log(logs.split('\n').slice(-50).join('\n'));
    } else {
      console.log('No logs found');
    }
  }

  async analyze() {
    try {
      const response = await this.makeRequest('/analyze', 'POST');
      console.log('Analysis successful:', response);
    } catch (error) {
      console.error('Failed to trigger analysis:', error.message);
    }
  }

  async makeRequest(path, method) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: this.healthCheckPort,
        path: path,
        method: method,
        timeout: 5000,
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.abort();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }
}

const manager = new SymbioticMemoryManager();
const command = process.argv[2];

switch (command) {
  case 'start':
    manager.start();
    break;
  case 'stop':
    manager.stop();
    break;
  case 'status':
    manager.status();
    break;
  case 'restart':
    manager.restart();
    break;
  case 'logs':
    manager.logs();
    break;
  case 'analyze':
    manager.analyze();
    break;
  default:
    console.log('Usage: node symbiotic-memory-manager.js [start|stop|status|restart|logs|analyze]');
}
