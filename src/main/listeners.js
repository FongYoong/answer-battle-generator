import { app, ipcMain, dialog } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import open from 'open'
import getDownloadsFolder from 'downloads-folder'
import { generate } from './generate';
import { web_assets } from './utils';
import mime from 'mime-types'

const downloadsFolder = getDownloadsFolder();
const defaultOutputPath = path.join(downloadsFolder, 'index.html')

function getExtensions(mimeType) {
    let extensions = []
    for (const [key, value] of Object.entries(mime.extensions)) {
        if(key.includes(mimeType)) {
            extensions = [...extensions, ...value]
        }
    }
    return extensions
}

export function createListeners() {

    ipcMain.handle('open_file', (_event, fileType, defaultPath) => {
        let filter;
        if (fileType == 'image') {
            filter = { name: "Images", extensions: getExtensions("image") } 
        }
        else if (fileType == 'audio') {
            filter = { name: "Audio", extensions: getExtensions("audio") } 
        }
        const selectedFiles = dialog.showOpenDialogSync(
            {
                title: "Select File",
                defaultPath,
                filters: [
                    filter,
                    { name: "All Files", extensions: ["*"] },
                ],
                properties: ['openFile', 'showHiddenFiles']
            }
        )

        return selectedFiles ? [selectedFiles[0], path.basename(selectedFiles[0])] : undefined
    });

    ipcMain.handle('get_default_output_path', (_event) => {
        return defaultOutputPath
    });

    ipcMain.handle('choose_save_file', (_event) => {
        const selectedFile = dialog.showSaveDialogSync(
            {
                title: "Save File",
                defaultPath: defaultOutputPath,
                filters: [
                    { name: "HTML files", extensions: ["html"] },
                    { name: "All Files", extensions: ["*"] },
                ],
                properties: ['showHiddenFiles']
            }
        )
        return [selectedFile, path.basename(selectedFile)]
    });

    ipcMain.on('preview_file', (_event, file_path, is_default) => {
        const final_path = is_default ? path.join(web_assets, file_path) : file_path ;
        open(final_path)
    });
    
    ipcMain.handle('generate', async (_event, data) => {
        await generate(data)
    });



}
