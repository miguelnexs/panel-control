import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const electronAPI = {
  ipcRenderer: {
    send: (channel: string, ...args: any[]): void => {
      ipcRenderer.send(channel, ...args)
    },
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
      ipcRenderer.on(channel, listener)
    },
    once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
      ipcRenderer.once(channel, listener)
    },
    invoke: (channel: string, ...args: any[]): Promise<any> => {
      return ipcRenderer.invoke(channel, ...args)
    },
    removeListener: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
      ipcRenderer.removeListener(channel, listener)
    },
    removeAllListeners: (channel: string): void => {
      ipcRenderer.removeAllListeners(channel)
    }
  }
}

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in d.ts)
  window.electron = electronAPI
  // @ts-ignore (define in d.ts)
  window.api = api
}
