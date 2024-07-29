import { app, BrowserWindow, shell, ipcMain, Menu, dialog } from 'electron'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'
import dbOperations from "./dbOperations"

import { Ollama } from 'ollama';
import { exec, spawn } from 'child_process';

const ollama = new Ollama();
const sessions = new Map();

let ollamaProcess = null;

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    minWidth: 800,
    minHeight: 600,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      //  webSecurity: false,
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  Menu.setApplicationMenu(null)

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

async function initApp() {
  try {
    await dbOperations.initializeDatabase();
    console.log('Database inizializzato con successo');
    createWindow();
  } catch (error) {
    console.error('Errore durante l\'inizializzazione del database:', error);
    app.quit();
  }
}

app.whenReady().then(() => { initApp(); checkOllamaStatus(); });

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

app.on('before-quit', () => {
  if (ollamaProcess) {
    ollamaProcess.kill();
  }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

ipcMain.handle('createSession', async (event, sessionName) => {
  if (!sessions.has(sessionName)) {
    sessions.set(sessionName, []);
  }
  return sessionName;
});

ipcMain.handle('generate', async (event, { sessionName, model, prompt }) => {
  try {
    const sessionHistory = sessions.get(sessionName) || [];
    const fullPrompt = sessionHistory.join('\n') + '\n' + prompt;
    const response = await ollama.generate({ model, prompt: fullPrompt });
    sessionHistory.push(`Human: ${prompt}`);
    sessionHistory.push(`AI: ${response.response}`);
    sessions.set(sessionName, sessionHistory);
    return response.response;
  } catch (error) {
    console.error('Errore:', error);
    throw error;
  }
});

ipcMain.handle('getSessions', () => {
  return Array.from(sessions.keys());
});

ipcMain.handle('checkOllamaStatus', () => {
  checkOllamaStatus();
});

ipcMain.handle('installOllama', () => {
  shell.openExternal('https://ollama.ai/download');
});

async function getAvailableModels() {
  try {
    const models = (await ollama.list())['models'];
    console.log(models);
    return models.map(model => model.name);

  } catch (error) {
    console.error('Errore nel recupero dei modelli:', error);
    return [];
  }
}

// Aggiungi questo handler IPC
ipcMain.handle('getAvailableModels', async () => {
  return await getAvailableModels();
});

function checkOllamaStatus() {
  exec('ollama --version', (error, stdout, stderr) => {
    if (error) {
      handleOllamaNotInstalled();
      return;
    }

    ollama.list()
      .then(() => {
        win.webContents.send('ollamaStatus', { status: 'active', version: stdout.trim() });
      })
      .catch((err) => {
        startOllama();
      });
  });
}

function handleOllamaNotInstalled() {
  dialog.showMessageBox(win, {
    type: 'error',
    title: 'Ollama non installato',
    message: 'Ollama non sembra essere installato. Vuoi aprire la pagina di installazione?',
    buttons: ['Sì', 'No']
  }).then(result => {
    if (result.response === 0) {
      shell.openExternal('https://ollama.ai/download');
    }
  });
  win.webContents.send('ollamaStatus', { status: 'not-installed' });
}

function startOllama() {
  const platform = os.platform();
  let command;
  let args;

  switch (platform) {
    case 'win32':
      command = 'ollama.exe';
      args = ['serve'];
      break;
    case 'darwin':
    case 'linux':
      command = 'ollama';
      args = ['serve'];
      break;
    default:
      dialog.showErrorBox('Errore', 'Sistema operativo non supportato');
      return;
  }

  ollamaProcess = spawn(command, args);

  ollamaProcess.stdout.on('data', (data) => {
    console.log(`Ollama output: ${data}`);
  });

  ollamaProcess.stderr.on('data', (data) => {
    console.error(`Ollama error: ${data}`);
  });

  ollamaProcess.on('close', (code) => {
    console.log(`Ollama process exited with code ${code}`);
  });

  setTimeout(() => {
    checkOllamaStatus();
  }, 2000);
}