const folderBtn = document.getElementById('folderBtn')
const folderPathElement = document.getElementById('folderPath')
const folderServerSwitch = document.getElementById('folderServerSwitch') // Updated element reference
const hostnameInput = document.getElementById('hostnameInput')
const usernameInput = document.getElementById('usernameInput')
const passwordInput = document.getElementById('passwordInput')

folderBtn.addEventListener('click', async () => {
    const folderPath = await window.electronAPI.openFolder()

    if (folderPath) {
        folderPathElement.innerText = folderPath
    }
})

folderServerSwitch.addEventListener('change', async (event) => {
    const isChecked = event.target.checked
    const folderPath = folderPathElement.innerText
    const broadcastName = hostnameInput.value 
    const username = usernameInput.value
    const password = passwordInput.value

    if (isChecked) {
        // Handle turning the server ON
        if (folderPath && folderPath.trim() !== "" && folderPath !== "None selected") {
            await window.electronAPI.startFolderServer(folderPath, broadcastName, username, password)
            console.log('Server started')
            folderServerSwitch.innerText = "Stop folder transfer server"
        } else {
            console.log('Cannot start server: No valid folder selected')
            folderServerSwitch.checked = false
        }
    } else {
        window.electronAPI.stopFolderServer()
        console.log('Server stopped')
        folderServerSwitch.innerText = "Start folder transfer server" 
    }
})