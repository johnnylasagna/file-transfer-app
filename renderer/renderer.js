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

// Download view Elements
const downloadViewFrame = document.getElementById('downloadFrame')

// Preview Elements
const previewFrame = document.getElementById('previewFrame')

// Tabs
const tabs = document.getElementById('settingsTabs')

function setDownloadView(url) {
    downloadViewFrame.setAttribute('src', url)
    tabs.setAttribute('activeid', 'downloadTab')
}

function setPreviewView(url) {
    previewFrame.setAttribute('src', url)
    tabs.setAttribute('activeid', 'previewTab')
}

downloadViewFrame.addEventListener('new-window', (event) => {
    event.preventDefault()
    setPreviewView(event.url)
})

downloadViewFrame.addEventListener('did-create-window', (event) => {
    event.preventDefault()
    if (event.url) {
        setPreviewView(event.url)
    }
})

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

    const ipv4Addresses = (server.addresses || []).filter(ip => ip.includes('.'));

    const ipList = ipv4Addresses.length > 0 ? ipv4Addresses.join(', ') : 'Unknown IP';

    contentDiv.innerHTML = `
        <div><strong>Host Name:</strong> ${server.host}</div>
        <div><strong>IP Addresses:</strong> ${ipList} (Port: ${server.port})</div>
        <div class="control-group" id="serverButtons" style="flex-wrap: wrap;"></div>
    `;

    const buttonsContainer = contentDiv.querySelector('#serverButtons');
    ipv4Addresses.forEach(ip => {
        const openButton = document.createElement('fluent-button');
        openButton.setAttribute('appearance', 'accent');
        openButton.style.marginTop = '10px';
        openButton.textContent = `Open ${ip}`;
        openButton.addEventListener('click', () => {
            // console.log(`http://${ip}:${server.port}`);
            setDownloadView(`http://${ip}:${server.port}`);
        });
        buttonsContainer.appendChild(openButton);
    });

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