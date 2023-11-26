// index.js

const { app, BrowserWindow, ipcMain, globalShortcut, webContents } = require("electron");
const sqlite3 = require('sqlite3').verbose();
const os = require('os');

let win;
let db;

function createWindow() {
  win = new BrowserWindow({
    width: 377,
    height: 610,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  win.loadFile(__dirname + "/index.html");
  win.addListener("ready-to-show", () => {
    win.show();
  });
}

function initDatabase() {
  db = new sqlite3.Database(`${os.homedir()}/notes.db`);
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT,content TEXT NOT NULL,timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)');
  });
}


function initShortcuts() {
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit()
  });
  globalShortcut.register('CommandOrControl+D', () => {
    win.webContents.send("clear_shortcut")
  });
  globalShortcut.register('CommandOrControl+T', () => {
    win.webContents.send("change_theme")
  })
}

app.whenReady().then(() => {
  initShortcuts();
  initDatabase();
  createWindow();
});

app.addListener("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("close_app", () => {
  app.quit();
});

ipcMain.on("save_note", (e, note) => {
  const insertNote = db.prepare('INSERT INTO notes (content) VALUES (?)');
  insertNote.run(note);
  insertNote.finalize();
});

ipcMain.handle("get_notes", (e) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM notes', (err, notes) => {
      if (err) {
        reject(err);
      } else {
        resolve(notes);
      }
    });
  });
});

ipcMain.on("delete_note", (e, note) => {
  const deleteNote = db.prepare('DELETE FROM notes WHERE  content = (?)');
  deleteNote.run(note);
  deleteNote.finalize();
});

ipcMain.on("clear_notes", (e, note) => {
  const clearNotes = db.prepare('DELETE FROM notes');
  clearNotes.run();
  clearNotes.finalize();
});



ipcMain.on("edit_note", (e, note, new_note) => {
  const clearNotes = db.prepare('UPDATE notes SET content = ? WHERE content = ?');
  clearNotes.run([new_note, note]);
  clearNotes.finalize();
});

async function openUrl(url) {
  const openModule = await import('open');
  return openModule.default(url);
}

ipcMain.on('github', () => {
  openUrl("https://github.com/Mohamed-Abbas-Homani")
})