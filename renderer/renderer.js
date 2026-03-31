// Folder Elements
const folderPathElement = document.getElementById('folderPath')
const folderBtn = document.getElementById('folderBtn')
const folderServerSwitch = document.getElementById('folderServerSwitch')
const folderServerSwitchText = document.getElementById('folderServerSwitchText')

// Hostname Elements
const updateHostnameBtn = document.getElementById('updateHostnameBtn');
const hostnameInput = document.getElementById('hostnameInput')

// Credential Elements
const updateCredentialsBtn = document.getElementById('updateCredentialsBtn');
const usernameInput = document.getElementById('usernameInput')
const passwordInput = document.getElementById('passwordInput')

// Server Elements
const refreshServersBtn = document.getElementById('refreshServersBtn')
const serversAccordion = document.getElementById('serversAccordion')

// Changes current shared folder
folderBtn.addEventListener('click', async () => {
    const folderPath = await window.electronAPI.openFolder()

    if (folderPath) {
        folderPathElement.innerText = folderPath
        if (folderServerSwitch.checked) {
            applyServerSettings();
        }
    }
})

// Common function to restart server whenever changes take place
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
            folderServerSwitchText.innerText = "Stop folder transfer server:"
        } else {
            console.log('Cannot start server: No valid folder selected')
            folderServerSwitch.checked = false
            folderServerSwitchText.innerText = "Start folder transfer server:"
        }
    } else {
        console.log('Settings saved. Will apply upon next server start.')
    }
}

// Turns server on and off
folderServerSwitch.addEventListener('change', async (event) => {
    const isChecked = event.target.checked

    if (isChecked) {
        await applyServerSettings();
    } else {
        await window.electronAPI.stopFolderServer()
        console.log('Server stopped')
        await startServerScan();
        folderServerSwitchText.innerText = "Start folder transfer server:"
    }
})

// Restart server when there are changes to hostname or credentials
updateHostnameBtn.addEventListener('click', applyServerSettings)
updateCredentialsBtn.addEventListener('click', applyServerSettings)

// Create server item 
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
        <div class="control-group">
            <fluent-button appearance="accent" onclick="window.open('http://${ipAddress}:${server.port}', '_blank')" style="margin-top: 10px;">
                Open in Browser
            </fluent-button>
        </div>
    `;

    accordionItem.appendChild(contentDiv);
    serversAccordion.appendChild(accordionItem);
}

// Scan servers and create server items
async function startServerScan() {
    serversAccordion.innerHTML = '';
    await window.electronAPI.findServers(createServerAccordionItem);
}

// Force rescanning of servers
refreshServersBtn.addEventListener('click', startServerScan);

// Find servers as soon as app starts
startServerScan();