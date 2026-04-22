const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend', 'HuellasConectadas');
const frontendDir = path.join(rootDir, 'frontend', 'WebAdopcion');
const backendPort = Number(process.env.BACKEND_PORT || 8080);
const frontendPort = Number(process.env.FRONTEND_PORT || 4200);
const backendHost = process.env.BACKEND_HOST || '127.0.0.1';

const children = new Set();
let backendStartedByScript = null;
let shuttingDown = false;

function command(name) {
  return process.platform === 'win32' ? `${name}.cmd` : name;
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encuentra ${label}: ${filePath}`);
  }
}

function prefixOutput(stream, label, writer) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.length > 0) {
        writer.write(`[${label}] ${line}\n`);
      }
    }
  });
  stream.on('end', () => {
    if (buffer.length > 0) {
      writer.write(`[${label}] ${buffer}\n`);
    }
  });
}

function spawnProcess(label, commandName, args, options) {
  const child = spawn(commandName, args, {
    cwd: options.cwd,
    env: process.env,
    shell: process.platform === 'win32',
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  children.add(child);
  child.on('exit', () => children.delete(child));
  prefixOutput(child.stdout, label, process.stdout);
  prefixOutput(child.stderr, label, process.stderr);
  return child;
}

function isPortOpen(port, host = backendHost) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout: 1000 });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

async function waitForPort(port, child, timeoutMs = 120000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`El backend termino antes de abrir el puerto ${port}. Revisa el log anterior.`);
    }

    if (await isPortOpen(port)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Tiempo de espera agotado: el backend no abrio el puerto ${port}.`);
}

function killProcessTree(child) {
  if (!child || child.killed || child.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    if (child === backendStartedByScript || child.exitCode === null) {
      killProcessTree(child);
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
  ensureFile(path.join(backendDir, 'pom.xml'), 'el pom.xml del backend');
  ensureFile(path.join(frontendDir, 'package.json'), 'el package.json del frontend');

  console.log(`[dev] Backend: ${backendDir}`);
  console.log(`[dev] Frontend: ${frontendDir}`);

  if (await isPortOpen(backendPort)) {
    console.log(`[dev] El backend ya responde en http://localhost:${backendPort}.`);
  } else {
    console.log(`[dev] Iniciando backend en http://localhost:${backendPort}...`);
    backendStartedByScript = spawnProcess('backend', command('mvn'), ['spring-boot:run'], { cwd: backendDir });
    await waitForPort(backendPort, backendStartedByScript);
    console.log(`[dev] Backend listo. Iniciando frontend en http://localhost:${frontendPort}...`);
  }

  const frontend = spawnProcess(
    'frontend',
    command('npm'),
    ['run', 'start', '--', '--port', String(frontendPort)],
    { cwd: frontendDir }
  );

  frontend.on('exit', (code) => {
    if (backendStartedByScript) {
      killProcessTree(backendStartedByScript);
    }
    process.exit(code || 0);
  });
}

main().catch((error) => {
  console.error(`[dev] ${error.message}`);
  shutdown(1);
});
