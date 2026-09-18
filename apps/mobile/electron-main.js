const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow;

function checkServerReady(url, maxAttempts = 15, interval = 500) {
  return new Promise((resolve) => {
    let attempts = 0;
    const poll = () => {
      attempts++;
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304) {
          resolve(true);
        } else if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          resolve(false);
        }
      }).on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          resolve(false);
        }
      });
    };
    poll();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'Smart Life Productivity - Widescreen Desktop',
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const staticIndexPath = path.join(__dirname, 'dist', 'index.html');
  const targetUrl = process.env.ELECTRON_START_URL || 'http://localhost:8081';

  if (fs.existsSync(staticIndexPath) && !process.env.ELECTRON_START_URL) {
    mainWindow.loadFile(staticIndexPath);
  } else {
    const isReady = await checkServerReady(targetUrl, 20, 500);
    if (isReady) {
      mainWindow.loadURL(targetUrl);
    } else {
      mainWindow.loadURL(targetUrl);
    }
  }

  // Create Custom Native Menu Bar for Windows EXE
  const template = [
    {
      label: '⚡ Smart Life',
      submenu: [
        { label: 'About Smart Life Productivity', role: 'about' },
        { type: 'separator' },
        { label: 'Quit Application', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: '🏠 Dashboard',
          click: () => {
            if (fs.existsSync(staticIndexPath) && !process.env.ELECTRON_START_URL) {
              mainWindow.loadFile(staticIndexPath);
            } else {
              mainWindow.loadURL(`${targetUrl}/`);
            }
          },
        },
        {
          label: '📅 Planner & Kanban',
          click: () => {
            if (fs.existsSync(staticIndexPath) && !process.env.ELECTRON_START_URL) {
              mainWindow.loadFile(staticIndexPath, { hash: '/planner' });
            } else {
              mainWindow.loadURL(`${targetUrl}/planner`);
            }
          },
        },
        {
          label: '🔥 Habits & Goals',
          click: () => {
            if (fs.existsSync(staticIndexPath) && !process.env.ELECTRON_START_URL) {
              mainWindow.loadFile(staticIndexPath, { hash: '/habits' });
            } else {
              mainWindow.loadURL(`${targetUrl}/habits`);
            }
          },
        },
        {
          label: '⏱️ Focus Studio',
          click: () => {
            if (fs.existsSync(staticIndexPath) && !process.env.ELECTRON_START_URL) {
              mainWindow.loadFile(staticIndexPath, { hash: '/focus' });
            } else {
              mainWindow.loadURL(`${targetUrl}/focus`);
            }
          },
        },
        {
          label: '🤖 AI Coach',
          click: () => {
            if (fs.existsSync(staticIndexPath) && !process.env.ELECTRON_START_URL) {
              mainWindow.loadFile(staticIndexPath, { hash: '/ai' });
            } else {
              mainWindow.loadURL(`${targetUrl}/ai`);
            }
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation & Guides',
          click: async () => {
            await shell.openExternal('https://docs.expo.dev');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
