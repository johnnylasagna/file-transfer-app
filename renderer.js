const fileBtn = document.getElementById('fileBtn')
const filePathElement = document.getElementById('filePath')

fileBtn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFile()
    if (filePath) {
        filePathElement.innerText = filePath
    }
})

const folderBtn = document.getElementById('folderBtn')
const folderPathElement = document.getElementById('folderPath')
const folderServerStartBtn = document.getElementById('folderServerBtn')

folderBtn.addEventListener('click', async () => {
    const folderPath = await window.electronAPI.openFolder()

    if (folderPath) {
        folderPathElement.innerText = folderPath
    }
})

folderServerStartBtn.addEventListener('click', async () => {
    const folderPath = folderPathElement.innerText

    if (folderPath && folderPath.trim() !== "") {
        await window.electronAPI.startFolderServer(folderPath)
        console.log('Server started')
    }
})