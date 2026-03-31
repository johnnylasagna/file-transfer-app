const rootContainer = document.getElementById('file-list');
let cart = new Set();

async function fetchFiles(path) {
    const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
    return await response.json();
}

async function renderDirectory(path, containerElement) {
    containerElement.innerHTML = '<div style="padding: 8px;">Loading...</div>';

    const files = await fetchFiles(path);
    containerElement.innerHTML = ''; 

    const folders = files.filter(f => f.isDirectory);
    const regularFiles = files.filter(f => !f.isDirectory);

    // Render Folders as an Accordion
    if (folders.length > 0) {
        const accordion = document.createElement('fluent-accordion');

        folders.forEach(folder => {
            const item = document.createElement('fluent-accordion-item');
            
            const heading = document.createElement('span');
            heading.slot = 'heading';
            heading.textContent = `${folder.name}`;
            item.appendChild(heading);

            const contentContainer = document.createElement('div');
            contentContainer.style.display = 'flex';
            contentContainer.style.flexDirection = 'column';
            contentContainer.style.paddingLeft = '16px'; 
            
            let isLoaded = false;

            // Lazy-load folder contents only when the accordion is expanded
            item.addEventListener('change', (e) => {
                if (e.target === item && item.expanded && !isLoaded) {
                    isLoaded = true;
                    renderDirectory(folder.relativePath, contentContainer);
                }
            });

            item.appendChild(contentContainer);
            accordion.appendChild(item);
        });
        containerElement.appendChild(accordion);
    }

    // Render Files
    if (regularFiles.length > 0) {
        const fileList = document.createElement('div');
        fileList.style.display = 'flex';
        fileList.style.flexDirection = 'column';
        fileList.style.marginTop = folders.length > 0 ? '8px' : '0';

        regularFiles.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'item'; 
            fileDiv.innerHTML = `
                <span class="file">${file.name}</span>
                <div class="item-actions">
                    <fluent-button appearance="neutral" onclick="window.open('/preview${file.relativePath}', '_blank')">Preview</fluent-button>
                    <fluent-button appearance="accent" onclick="toggleCart('${file.relativePath}', '${file.name}')">Add to Cart</fluent-button>
                </div>
            `;
            fileList.appendChild(fileDiv);
        });
        containerElement.appendChild(fileList);
    }

    if (files.length === 0) {
        containerElement.innerHTML = '<div style="padding: 8px; color: gray;">This folder is empty.</div>';
    }
}

function toggleCart(path, name) {
    if (cart.has(path)) {
        cart.delete(path);
    } else {
        cart.add(path);
    }
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-list');
    list.innerHTML = '';
    
    cart.forEach(path => {
        const name = path.split('/').pop();
        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
            <span>${name}</span>
            <div class="item-actions">
                <fluent-button appearance="outline" onclick="toggleCart('${path}')">Remove</fluent-button>
            </div>
        `;
        list.appendChild(li);
    });
    
    const downloadBtn = document.getElementById('downloadBtn');
    if (cart.size === 0) {
        downloadBtn.setAttribute('disabled', 'true');
    } else {
        downloadBtn.removeAttribute('disabled');
    }
}

async function downloadCartAsZip() {
    const files = Array.from(cart);
    const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files })
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'download.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

document.getElementById('downloadBtn').addEventListener('click', downloadCartAsZip);

// Initialize the root directory
renderDirectory('/', rootContainer);