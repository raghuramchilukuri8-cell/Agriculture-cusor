// Ferti Verse - Language Switching and Dynamic Content
(function () {
    'use strict';

    let currentLang = localStorage.getItem('fertiverse-lang') || 'en';

    const langSelect = document.getElementById('lang-select');
    const updateAllContent = () => {
        const t = translations[currentLang];
        if (!t) return;

        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.setAttribute('placeholder', t[key]);
        });

        // Render farms
        const farmsEl = document.getElementById('farms-content');
        if (farmsEl && t.farms) {
            farmsEl.innerHTML = t.farms
                .map(
                    (f) =>
                        `<div class="farm-item">
                    <h3>${f.name}</h3>
                    <p>${f.fertilizers}</p>
                </div>`
                )
                .join('');
        }

        // Render fertilizers
        const fertEl = document.getElementById('fertilizers-content');
        if (fertEl && t.fertilizers) {
            fertEl.innerHTML = t.fertilizers
                .map(
                    (f) =>
                        `<div class="fertilizer-item">
                    <h3>${f.name}</h3>
                    <p>${f.desc}</p>
                </div>`
                )
                .join('');
        }

        // Render bacteria table
        const tbody = document.getElementById('bacteria-table-body');
        if (tbody && t.bacteriaTable) {
            tbody.innerHTML = t.bacteriaTable
                .map(
                    (row) =>
                        `<tr>
                    <td>${row.bacteria}</td>
                    <td>${row.fertilizers}</td>
                    <td>${row.farms}</td>
                </tr>`
                )
                .join('');
        }
    };

    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('fertiverse-lang', currentLang);
        updateAllContent();
    });

    // Set initial language
    langSelect.value = currentLang;
    updateAllContent();

    // Contact page: notes, invite message, and real-time community tools
    const noteArea = document.getElementById('community-note');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const noteStatus = document.getElementById('note-status');
    if (noteArea && saveNoteBtn && noteStatus) {
        const savedNote = localStorage.getItem('fertiverse-note') || '';
        noteArea.value = savedNote;
        saveNoteBtn.addEventListener('click', () => {
            localStorage.setItem('fertiverse-note', noteArea.value.trim());
            noteStatus.textContent = 'Note saved successfully.';
        });
    }

    const inviteBtn = document.getElementById('invite-btn');
    const inviteEmail = document.getElementById('invite-email');
    const inviteStatus = document.getElementById('invite-status');
    if (inviteBtn && inviteEmail && inviteStatus) {
        inviteBtn.addEventListener('click', () => {
            const email = inviteEmail.value.trim();
            if (!email) {
                inviteStatus.textContent = 'Please enter an email address.';
                return;
            }
            inviteStatus.textContent = `Invite sent to ${email}.`;
            inviteEmail.value = '';
        });
    }

    const photoUpload = document.getElementById('photo-upload');
    const sharePhotoBtn = document.getElementById('share-photo-btn');
    const photoPreview = document.getElementById('photo-preview');
    const sharedPhotoFeed = document.getElementById('shared-photo-feed');
    if (photoUpload && photoPreview) {
        photoUpload.addEventListener('change', (event) => {
            photoPreview.innerHTML = '';
            Array.from(event.target.files).forEach((file) => {
                if (!file.type.startsWith('image/')) return;
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = file.name;
                photoPreview.appendChild(img);
            });
        });
    }

    const hasSocketClient = typeof window.io === 'function';
    const socket = hasSocketClient ? window.io() : null;

    const chatInput = document.getElementById('chat-input');
    const chatName = document.getElementById('chat-name');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    if (chatInput && chatSendBtn && chatMessages && chatName) {
        const addChatMessage = (msg) => {
            const div = document.createElement('div');
            div.className = 'chat-message';
            div.textContent = msg;
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        if (socket) {
            socket.on('chat:message', (payload) => {
                addChatMessage(`${payload.name}: ${payload.message}`);
            });
        } else {
            addChatMessage('Realtime server is offline. Start server.js for live chat.');
        }

        chatSendBtn.addEventListener('click', () => {
            const msg = chatInput.value.trim();
            const name = chatName.value.trim() || 'Farmer';
            if (!msg) {
                return;
            }
            if (socket) {
                socket.emit('chat:message', { name, message: msg });
            } else {
                addChatMessage(`${name}: ${msg}`);
            }
            chatInput.value = '';
        });
    }

    if (sharePhotoBtn && photoUpload && sharedPhotoFeed) {
        const renderSharedPhoto = (payload) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'shared-photo-item';
            const img = document.createElement('img');
            img.src = payload.dataUrl;
            img.alt = payload.fileName || 'Shared farm photo';
            const meta = document.createElement('p');
            meta.textContent = payload.name ? `By ${payload.name}` : 'Community photo';
            wrapper.appendChild(img);
            wrapper.appendChild(meta);
            sharedPhotoFeed.prepend(wrapper);
        };

        if (socket) {
            socket.on('photo:share', renderSharedPhoto);
            socket.on('community:init', (payload) => {
                if (!payload || !payload.photos) return;
                sharedPhotoFeed.innerHTML = '';
                payload.photos.forEach(renderSharedPhoto);
            });
        }

        sharePhotoBtn.addEventListener('click', () => {
            const files = Array.from(photoUpload.files || []);
            const nameInput = document.getElementById('chat-name');
            const name = (nameInput && nameInput.value.trim()) || 'Farmer';
            files.forEach((file) => {
                if (!file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = () => {
                    const payload = {
                        name,
                        fileName: file.name,
                        dataUrl: reader.result,
                    };
                    if (socket) {
                        socket.emit('photo:share', payload);
                    } else {
                        renderSharedPhoto(payload);
                    }
                };
                reader.readAsDataURL(file);
            });
            photoUpload.value = '';
            photoPreview.innerHTML = '';
        });
    }
})();
