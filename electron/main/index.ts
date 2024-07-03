import {app, BrowserWindow, shell, ipcMain} from 'electron'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import os from 'node:os'

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
        webPreferences: {
            preload,
        },
    })
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
    win.webContents.setWindowOpenHandler(({url}) => {
        if (url.startsWith('https:')) shell.openExternal(url)
        return {action: 'deny'}
    })
    // win.webContents.on('will-navigate', (event, url) => { }) #344
    win.on('closed', () => {
        win = null
        if (childWindow) {
            childWindow.close()
        }
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    console.log('app.on window-all-closed')
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
        childWindow.loadFile(indexHtml, {hash: arg})
    }
})
let childWindow: BrowserWindow | null = null
ipcMain.on('open-hoverball', () => {
    console.log('open-hoverball')
    if (childWindow) {
        childWindow.close()
        childWindow = null
        return
    }
    // 开启一个新窗口
    childWindow = new BrowserWindow({
        title: '悬浮球',
        type: 'toolbar',
        width: 60,
        height: 60,
        alwaysOnTop: true, // 设置为悬浮窗
        frame: false, // 如果你不需要窗口的边框和标题栏
        transparent: false, // 如果你需要窗口透明
        skipTaskbar: false, // 不在任务栏显示窗口
        // 不可改变大小
        resizable: true,
        webPreferences: {
            preload,
        }

    })
    if (VITE_DEV_SERVER_URL) { // #29球8
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#/hoverball`)
        // Open devTool if the app is not packaged
        childWindow.webContents.openDevTools()
    } else {
        // childWindow.loadFile(indexHtml+'/#/hoverball')
        childWindow.loadFile(indexHtml, {hash: 'hoverball'})
        childWindow.webContents.openDevTools()
    }
})

// 鼠标拖动悬浮球
ipcMain.on('drag-hoverball', (event, position) => {
    console.log('drag-hoverball', position)
    if (childWindow) {
        childWindow.setBounds({x: position.x, y: position.y, width: 60, height: 60})
    }
})
