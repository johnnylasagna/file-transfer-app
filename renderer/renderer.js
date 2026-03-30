const folderPathElement = document.getElementById('folderPath')
const folderBtn = document.getElementById('folderBtn')
const folderServerSwitch = document.getElementById('folderServerSwitch')

const updateHostnameBtn = document.getElementById('updateHostnameBtn');
const hostnameInput = document.getElementById('hostnameInput')

const updateCredentialsBtn = document.getElementById('updateCredentialsBtn');
const usernameInput = document.getElementById('usernameInput')
const passwordInput = document.getElementById('passwordInput')

const refreshServersBtn = document.getElementById('refreshServersBtn')
const serversAccordion = document.getElementById('serversAccordion')

folderBtn.addEventListener('click', async () => {
    const folderPath = await window.electronAPI.openFolder()

    if (folderPath) {
        folderPathElement.innerText = folderPath
        if (folderServerSwitch.checked) {
            applyServerSettings();
        }
    }
})

async function applyServerSettings() {
    const isChecked = folderServerSwitch.checked
    const folderPath = folderPathElement.innerText
    const broadcastName = hostnameInput.value
    const username = usernameInput.value
    const password = passwordInput.value

    if (isChecked) {
        await window.electronAPI.stopFolderServer()
        console.log('Applying new settings...')

        if (folderPath && folderPath.trim() !== "" && folderPath !== "None selected") {
            await window.electronAPI.startFolderServer(folderPath, broadcastName, username, password)
            console.log('Server running')
            folderServerSwitch.innerText = "Stop folder transfer server"
        } else {
            console.log('Cannot start server: No valid folder selected')
            folderServerSwitch.checked = false
            folderServerSwitch.innerText = "Start folder transfer server"
        }
    } else {
        console.log('Settings saved. Will apply upon next server start.')
    }
}

folderServerSwitch.addEventListener('change', async (event) => {
    const isChecked = event.target.checked

    if (isChecked) {
        await applyServerSettings();
    } else {
        await window.electronAPI.stopFolderServer()
        console.log('Server stopped')
        folderServerSwitch.innerText = "Start folder transfer server"
    }
})

updateHostnameBtn.addEventListener('click', applyServerSettings)
updateCredentialsBtn.addEventListener('click', applyServerSettings)

function createServerAccordionItem(server) {
    const accordionItem = document.createElement('fluent-accordion-item');

    const headingSpan = document.createElement('span');
    headingSpan.slot = 'heading';
    headingSpan.textContent = server.name || 'Unknown Server';
    accordionItem.appendChild(headingSpan);

    const contentDiv = document.createElement('div');
    contentDiv.style.display = 'flex';
    contentDiv.style.flexDirection = 'column';
    contentDiv.style.gap = '8px';
    contentDiv.style.padding = '10px 0';

    const ipAddress = server.addresses && server.addresses.length > 0 ? server.addresses[0] : 'Unknown IP';

    contentDiv.innerHTML = `
        <div><strong>Host Name:</strong> ${server.host}</div>
        <div><strong>IP Address:</strong> ${ipAddress}:${server.port}</div>
        <fluent-button appearance="accent" onclick="window.open('http://${ipAddress}:${server.port}', '_blank')" style="margin-top: 10px;">
            Open in Browser
        </fluent-button>
    `;

    accordionItem.appendChild(contentDiv);
    serversAccordion.appendChild(accordionItem);
}

async function startServerScan() {
    serversAccordion.innerHTML = '';
    await window.electronAPI.findServers(createServerAccordionItem);
}

refreshServersBtn.addEventListener('click', startServerScan);

startServerScan();