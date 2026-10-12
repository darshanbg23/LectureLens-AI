(function () {
    'use strict';

    var input            = document.getElementById('question-input');
    var askBtn           = document.getElementById('ask-btn');
    var results          = document.getElementById('results');
    var emptyState       = document.getElementById('empty-state');
    var sidebar          = document.getElementById('sidebar');
    var sidebarList      = document.getElementById('sidebar-list');
    var sidebarEmpty     = document.getElementById('sidebar-empty');
    var sidebarOverlay   = document.getElementById('sidebar-overlay');
    var btnToggle        = document.getElementById('btn-toggle-sidebar');
    var btnNew           = document.getElementById('btn-new-question');
    var btnClear         = document.getElementById('btn-clear-history');
    var btnUpload        = document.getElementById('btn-upload');
    var btnLibrary       = document.getElementById('btn-library');
    var fileInput        = document.getElementById('video-file-input');
    var resizeHandle     = document.getElementById('sidebar-resize-handle');
    var toast            = document.getElementById('toast');

    var dashboard        = document.getElementById('dashboard');
    var dashboardList    = document.getElementById('dashboard-list');
    var dashboardEmpty   = document.getElementById('dashboard-empty');
    var btnBackToSearch  = document.getElementById('btn-back-to-search');
    var inputArea        = document.getElementById('input-area');

    var deleteModal      = document.getElementById('delete-modal');
    var modalLectureName = document.getElementById('modal-lecture-name');
    var modalCancel      = document.getElementById('modal-cancel');
    var modalConfirm     = document.getElementById('modal-confirm');

    var uploadPanel      = document.getElementById('upload-panel');
    var uploadPanelBody  = document.getElementById('upload-panel-body');
    var uploadFilename   = document.getElementById('upload-panel-filename');
    var uploadSubstatus  = document.getElementById('upload-panel-substatus');
    var uploadPercent    = document.getElementById('upload-panel-percent');
    var uploadProgressBar= document.getElementById('upload-panel-progress-bar');
    var uploadStepper    = document.getElementById('upload-panel-stepper');
    var uploadFooter     = document.getElementById('upload-panel-footer');
    var uploadMinimize   = document.getElementById('upload-panel-minimize');
    var uploadCancel     = document.getElementById('upload-panel-cancel');
    var uploadPill       = document.getElementById('upload-pill');
    var uploadPillText   = document.querySelector('.upload-pill-text');

    var ICON = {
        search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        copy: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        alert: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        checkCircle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        retry: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
        readyDot: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    };

    var isProcessing = false;
    var isUploadActive = false;
    var isPanelMinimized = false;
    var isDashboardVisible = false;
    var chats = [];
    var activeChatId = null;
    var CHATS_STORAGE_KEY = 'lecturelens_chats';
    var ACTIVE_CHAT_KEY = 'lecturelens_active_chat_id';
    var statusPollTimer = null;
    var pendingDeleteId = null;
    var pendingDeleteTitle = '';
    var currentUploadSourceId = '';
    var lastKnownUploadStatus = '';

    var PHASES = [
        { text: 'Searching lectures...', at: 0 },
        { text: 'Retrieving relevant context...', at: 2500 },
        { text: 'Generating answer...', at: 5000 }
    ];

    var STATUS_LABELS = {
        'uploading':  'Uploading',
        'processing': 'Processing',
        'indexing':   'Indexing',
        'ready':      'Ready',
        'failed':     'Failed',
        'deleting':   'Deleting'
    };

    var STEP_ORDER = ['uploading', 'processing', 'indexing', 'ready'];

    var SUBSTATUS_TEXT = {
        'uploading':  'Saving video file...',
        'processing': 'Extracting audio & transcribing...',
        'indexing':   'Building search index...',
        'ready':      'Lecture is ready to search',
        'failed':     'Processing failed'
    };

    function loadChatsFromStorage() {
        try {
            var raw = localStorage.getItem(CHATS_STORAGE_KEY);
            chats = raw ? JSON.parse(raw) : [];
            activeChatId = localStorage.getItem(ACTIVE_CHAT_KEY) || null;

            if (activeChatId) {
                var exists = chats.some(function (c) { return c.id === activeChatId; });
                if (!exists) activeChatId = chats.length > 0 ? chats[0].id : null;
            } else if (chats.length > 0) {
                activeChatId = chats[0].id;
            }
        } catch (e) {
            chats = [];
            activeChatId = null;
        }
    }

    function saveChatsToStorage() {
        try {
            localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
            if (activeChatId) {
                localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
            } else {
                localStorage.removeItem(ACTIVE_CHAT_KEY);
            }
        } catch (e) {
            console.error('Failed to save chats:', e);
        }
    }

    function getActiveChat() {
        if (!activeChatId) return null;
        for (var i = 0; i < chats.length; i++) {
            if (chats[i].id === activeChatId) return chats[i];
        }
        return null;
    }

    if (window.innerWidth >= 1024) {
        document.body.classList.add('sidebar-open');
    }

    var savedSidebarWidth = localStorage.getItem('lecturelens-sidebar-width');
    if (savedSidebarWidth) {
        document.documentElement.style.setProperty('--sidebar-w', savedSidebarWidth);
    }

    askBtn.addEventListener('click', handleAsk);

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
        }
    });

    input.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    btnToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    btnNew.addEventListener('click', newQuestion);
    btnClear.addEventListener('click', clearAll);
    btnUpload.addEventListener('click', handleUploadClick);
    fileInput.addEventListener('change', handleFileSelected);
    btnLibrary.addEventListener('click', showDashboard);
    btnBackToSearch.addEventListener('click', showSearch);

    modalCancel.addEventListener('click', closeDeleteModal);
    modalConfirm.addEventListener('click', confirmDelete);
    deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) closeDeleteModal();
    });

    uploadMinimize.addEventListener('click', minimizePanel);
    uploadCancel.addEventListener('click', cancelUpload);
    uploadPill.addEventListener('click', expandPanel);


    function showDashboard() {
        isDashboardVisible = true;
        results.style.display = 'none';
        dashboard.style.display = 'block';
        inputArea.style.display = 'none';
        btnLibrary.classList.add('is-active');
        fetchLectures();
        if (window.innerWidth < 1024) closeSidebar();
    }

    function showSearch() {
        isDashboardVisible = false;
        results.style.display = 'flex';
        dashboard.style.display = 'none';
        inputArea.style.display = '';
        btnLibrary.classList.remove('is-active');
        input.focus();
        if (window.innerWidth < 1024) closeSidebar();
    }


    function handleAsk() {
        if (isProcessing) return;

        if (isDashboardVisible) showSearch();

        var question = input.value.trim();
        if (!question) { showToast('Enter a question to search.'); input.focus(); return; }

        input.value = '';
        input.style.height = 'auto';

        var activeChat = getActiveChat();
        if (!activeChat) {
            var title = question.length > 30 ? question.substring(0, 30) + '...' : question;
            activeChat = {
                id: 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                title: title,
                updatedAt: Date.now(),
                messages: []
            };
            chats.unshift(activeChat);
            activeChatId = activeChat.id;
            saveChatsToStorage();
            renderHistory();
        } else {
            activeChat.updatedAt = Date.now();
        }

        if (emptyState) emptyState.style.display = 'none';

        var card = buildCardShell(question);
        var skeleton = buildSkeleton();
        card.appendChild(skeleton);
        results.appendChild(card);
        scrollToBottom();
        setProcessing(true);

        var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        var timers = startPhases(skeleton);

        fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            clearAll_timers(timers);
            fadeOutSkeleton(skeleton, function () {
                if (data.success) {
                    card.appendChild(buildAnswer(data.answer));
                    card.appendChild(buildFooter(data.answer, timeStr));

                    activeChat.messages.push({
                        id: 'msg-' + Date.now(),
                        question: question,
                        answer: data.answer,
                        time: timeStr
                    });
                    saveChatsToStorage();
                } else {
                    var errText = data.error || 'An unexpected error occurred.';
                    card.classList.add('is-error');
                    card.appendChild(buildError(errText));

                    activeChat.messages.push({
                        id: 'msg-' + Date.now(),
                        question: question,
                        error: errText,
                        time: timeStr
                    });
                    saveChatsToStorage();
                }
                scrollToBottom();
            });
        })
        .catch(function (err) {
            clearAll_timers(timers);
            fadeOutSkeleton(skeleton, function () {
                var connErr = 'Could not connect to the server. Make sure Flask and Ollama are running.';
                card.classList.add('is-error');
                card.appendChild(buildError(connErr));

                activeChat.messages.push({
                    id: 'msg-' + Date.now(),
                    question: question,
                    error: connErr,
                    time: timeStr
                });
                saveChatsToStorage();
                scrollToBottom();
            });
            console.error('Request failed:', err);
        })
        .finally(function () {
            setProcessing(false);
            input.focus();
        });
    }


    function handleUploadClick() {
        if (isUploadActive) {
            showToast('An upload is already in progress.');
            return;
        }
        fileInput.click();
        if (window.innerWidth < 1024) closeSidebar();
    }

    function handleFileSelected() {
        var file = fileInput.files[0];
        fileInput.value = '';

        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.mp4')) {
            showToast('Only .mp4 files are accepted.');
            return;
        }

        isUploadActive = true;
        isPanelMinimized = false;
        lastKnownUploadStatus = 'uploading';
        showUploadPanel(file.name, 'uploading');

        var formData = new FormData();
        formData.append('video', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                currentUploadSourceId = data.source_id || '';
                var title = (data.lecture_title || file.name).replace(/_/g, ' ');
                updateUploadPanel(title, 'processing');
                startStatusPolling(title);
            } else {
                updateUploadPanel(file.name, 'failed', data.error || 'Upload failed.');
                isUploadActive = false;
            }
        })
        .catch(function () {
            updateUploadPanel(file.name, 'failed', 'Upload failed. Check that Flask is running.');
            isUploadActive = false;
        });
    }

    function startStatusPolling(displayName) {
        stopStatusPolling();

        statusPollTimer = setInterval(function () {
            fetch('/upload/status')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (!data.success) return;

                var status = data.status;
                var errorMsg = data.error || '';
                var name = displayName || data.lecture_title || data.filename;

                if (status === 'idle' || status === 'cancelled') {
                    stopStatusPolling();
                    isUploadActive = false;
                    dismissPanel();
                    return;
                }

                updateUploadPanel(name, status, errorMsg);

                if (status === 'ready') {
                    stopStatusPolling();
                    isUploadActive = false;
                    if (isDashboardVisible) fetchLectures();
                    setTimeout(function () {
                        dismissPanelSmooth();
                    }, 4000);
                } else if (status === 'failed') {
                    stopStatusPolling();
                    isUploadActive = false;
                    if (isDashboardVisible) fetchLectures();
                }
            })
            .catch(function () {
            });
        }, 2500);
    }

    function stopStatusPolling() {
        if (statusPollTimer) {
            clearInterval(statusPollTimer);
            statusPollTimer = null;
        }
    }


    function cancelUpload() {
        if (!currentUploadSourceId) {
            dismissPanel();
            isUploadActive = false;
            return;
        }

        fetch('/lectures/' + encodeURIComponent(currentUploadSourceId) + '/cancel', {
            method: 'POST'
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                showToast('Upload cancelled.');
                stopStatusPolling();
                isUploadActive = false;
                currentUploadSourceId = '';
                dismissPanel();
                if (isDashboardVisible) fetchLectures();
            } else {
                showToast(data.error || 'Could not cancel.');
            }
        })
        .catch(function () {
            showToast('Could not connect to server.');
        });
    }


    function showUploadPanel(filename, status) {
        uploadPanel.style.display = '';
        uploadPanel.className = 'upload-panel';
        uploadPill.style.display = 'none';
        isPanelMinimized = false;

        uploadFilename.textContent = filename;
        updatePanelState(status);
    }

    function updateUploadPanel(filename, status, errorMsg) {
        uploadFilename.textContent = filename;
        updatePanelState(status, errorMsg);

        if (isPanelMinimized) {
            uploadPillText.textContent = (STATUS_LABELS[status] || status) + '...';
        }
    }

    function updatePanelState(status, errorMsg) {
        uploadSubstatus.textContent = errorMsg && status === 'failed'
            ? (errorMsg.length > 50 ? errorMsg.substring(0, 50) + '...' : errorMsg)
            : (SUBSTATUS_TEXT[status] || status);

        if (status === 'ready') {
            uploadPercent.textContent = '100%';
            uploadProgressBar.style.width = '100%';
            uploadProgressBar.classList.remove('is-indeterminate');
        } else if (status === 'failed') {
            uploadPercent.textContent = '';
            uploadProgressBar.style.width = '0%';
            uploadProgressBar.classList.remove('is-indeterminate');
        } else {
            uploadPercent.textContent = '';
            uploadProgressBar.style.width = '100%';
            uploadProgressBar.classList.add('is-indeterminate');
        }

        updateStepper(status);

        uploadPanel.className = 'upload-panel';
        if (status === 'ready') uploadPanel.classList.add('is-ready');
        if (status === 'failed') uploadPanel.classList.add('is-failed');

        var headerText = uploadPanel.querySelector('.upload-panel-header-text');
        if (status === 'ready') {
            headerText.textContent = 'Upload complete';
        } else if (status === 'failed') {
            headerText.textContent = 'Upload failed';
        } else {
            headerText.textContent = 'Uploading and processing';
        }

        updatePanelFooter(status);
    }

    function updateStepper(status) {
        var steps = uploadStepper.querySelectorAll('.stepper-step');
        var lines = uploadStepper.querySelectorAll('.stepper-line');
        var currentIdx = STEP_ORDER.indexOf(status);

        steps.forEach(function (step, i) {
            step.className = 'stepper-step';
            var stepName = step.getAttribute('data-step');

            if (status === 'failed') {
                if (STEP_ORDER.indexOf(stepName) < currentIdx) {
                    step.classList.add('is-done');
                } else if (STEP_ORDER.indexOf(stepName) === currentIdx || (currentIdx === -1 && i === 0)) {
                    step.classList.add('is-failed');
                }
            } else if (status === 'ready') {
                step.classList.add('is-ready');
            } else {
                var stepIdx = STEP_ORDER.indexOf(stepName);
                if (stepIdx < currentIdx) {
                    step.classList.add('is-done');
                } else if (stepIdx === currentIdx) {
                    step.classList.add('is-active');
                }
            }
        });

        lines.forEach(function (line, i) {
            line.className = 'stepper-line';

            if (status === 'ready') {
                line.classList.add('is-ready');
            } else if (i < currentIdx) {
                line.classList.add('is-done');
            }
        });
    }

    function updatePanelFooter(status) {
        uploadFooter.innerHTML = '';

        if (status === 'failed') {
            if (currentUploadSourceId) {
                var retryBtn = document.createElement('button');
                retryBtn.className = 'upload-panel-retry';
                retryBtn.innerHTML = ICON.retry + ' Retry';
                retryBtn.addEventListener('click', function () {
                    retryFromPanel();
                });
                uploadFooter.appendChild(retryBtn);
            }

            var dismissBtn = document.createElement('button');
            dismissBtn.className = 'upload-panel-cancel';
            dismissBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Dismiss';
            dismissBtn.addEventListener('click', dismissPanel);
            uploadFooter.appendChild(dismissBtn);
        } else if (status === 'ready') {
            var doneBtn = document.createElement('button');
            doneBtn.className = 'upload-panel-retry';
            doneBtn.innerHTML = ICON.readyDot + ' Done';
            doneBtn.addEventListener('click', dismissPanel);
            uploadFooter.appendChild(doneBtn);
        } else {
            var cancelBtn = document.createElement('button');
            cancelBtn.className = 'upload-panel-cancel';
            cancelBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel';
            cancelBtn.addEventListener('click', cancelUpload);
            uploadFooter.appendChild(cancelBtn);
        }
    }

    function retryFromPanel() {
        if (!currentUploadSourceId) return;

        fetch('/lectures/' + encodeURIComponent(currentUploadSourceId) + '/retry', {
            method: 'POST'
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                isUploadActive = true;
                updateUploadPanel(uploadFilename.textContent, 'uploading');
                startStatusPolling(uploadFilename.textContent);
            } else {
                showToast(data.error || 'Retry failed.');
            }
        })
        .catch(function () {
            showToast('Could not connect to server.');
        });
    }

    function minimizePanel() {
        isPanelMinimized = true;
        uploadPanel.style.display = 'none';
        uploadPill.style.display = '';
    }

    function expandPanel() {
        isPanelMinimized = false;
        uploadPill.style.display = 'none';
        uploadPanel.style.display = '';
    }

    function dismissPanel() {
        uploadPanel.style.display = 'none';
        uploadPill.style.display = 'none';
        isPanelMinimized = false;
    }

    function dismissPanelSmooth() {
        if (uploadPanel.style.display === 'none') return;
        uploadPanel.classList.add('is-hiding');
        setTimeout(function () {
            uploadPanel.style.display = 'none';
            uploadPanel.classList.remove('is-hiding');
            uploadPill.style.display = 'none';
        }, 250);
    }


    function fetchLectures() {
        fetch('/lectures')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (!data.success) return;
            renderDashboard(data.lectures);
        })
        .catch(function () {
            dashboardList.innerHTML =
                '<div class="dashboard-empty"><p>Failed to load lectures.</p></div>';
        });
    }

    function renderDashboard(lectures) {
        dashboardList.innerHTML = '';

        if (!lectures || lectures.length === 0) {
            dashboardList.appendChild(dashboardEmpty);
            dashboardEmpty.style.display = 'flex';
            return;
        }

        dashboardEmpty.style.display = 'none';

        lectures.sort(function (a, b) {
            return (a.number || '').localeCompare(b.number || '');
        });

        lectures.forEach(function (lec) {
            var row = buildLectureRow(lec);
            dashboardList.appendChild(row);
        });
    }

    function buildLectureRow(lec) {
        var row = document.createElement('div');
        row.className = 'lecture-row';
        row.setAttribute('data-source-id', lec.source_id);

        var numberEl = document.createElement('div');
        numberEl.className = 'lecture-number';
        numberEl.textContent = lec.number || '#';

        var infoEl = document.createElement('div');
        infoEl.className = 'lecture-info';

        var titleEl = document.createElement('div');
        titleEl.className = 'lecture-title';
        titleEl.textContent = (lec.title || '').replace(/_/g, ' ');

        var metaEl = document.createElement('div');
        metaEl.className = 'lecture-meta';
        metaEl.textContent = (lec.file_type || 'mp4').toUpperCase();

        infoEl.appendChild(titleEl);
        infoEl.appendChild(metaEl);

        if (lec.status === 'failed' && lec.error) {
            var errorEl = document.createElement('div');
            errorEl.className = 'lecture-error';
            errorEl.textContent = lec.error.length > 60
                ? lec.error.substring(0, 60) + '...'
                : lec.error;
            errorEl.title = lec.error;
            infoEl.appendChild(errorEl);
        }

        var statusEl = buildStatusBadge(lec.status);

        var actionsEl = document.createElement('div');
        actionsEl.className = 'lecture-actions';

        if (lec.status === 'failed') {
            var retryBtn = document.createElement('button');
            retryBtn.className = 'lecture-retry-btn';
            retryBtn.innerHTML = ICON.retry + ' Retry';
            retryBtn.title = 'Retry processing';
            retryBtn.addEventListener('click', function () {
                retryLecture(lec.source_id);
            });
            actionsEl.appendChild(retryBtn);
        }

        var isActiveState = (lec.status === 'uploading' || lec.status === 'processing' ||
                             lec.status === 'indexing' || lec.status === 'deleting');
        if (!isActiveState) {
            var deleteBtn = document.createElement('button');
            deleteBtn.className = 'lecture-action-btn';
            deleteBtn.innerHTML = ICON.trash;
            deleteBtn.title = 'Delete lecture';
            deleteBtn.addEventListener('click', function () {
                openDeleteModal(lec.source_id, (lec.title || '').replace(/_/g, ' '));
            });
            actionsEl.appendChild(deleteBtn);
        }

        row.appendChild(numberEl);
        row.appendChild(infoEl);
        row.appendChild(statusEl);
        row.appendChild(actionsEl);

        return row;
    }

    function buildStatusBadge(status) {
        var el = document.createElement('div');
        el.className = 'lecture-status';

        var isActive = (status === 'uploading' || status === 'processing' || status === 'indexing');
        var isDeleting = (status === 'deleting');

        if (isActive) {
            el.classList.add('is-active');
            el.innerHTML = '<div class="status-spinner"></div>' + escapeHtml(STATUS_LABELS[status] || status);
        } else if (isDeleting) {
            el.classList.add('is-deleting');
            el.innerHTML = '<div class="status-spinner is-deleting"></div>' + escapeHtml(STATUS_LABELS[status]);
        } else if (status === 'ready') {
            el.classList.add('is-ready');
            el.innerHTML = ICON.readyDot + ' ' + escapeHtml(STATUS_LABELS[status]);
        } else if (status === 'failed') {
            el.classList.add('is-failed');
            el.innerHTML = ICON.alert + ' ' + escapeHtml(STATUS_LABELS[status]);
        } else {
            el.textContent = STATUS_LABELS[status] || status;
        }

        return el;
    }


    function openDeleteModal(sourceId, title) {
        pendingDeleteId = sourceId;
        pendingDeleteTitle = title;
        modalLectureName.textContent = title;
        deleteModal.style.display = '';
    }

    function closeDeleteModal() {
        deleteModal.style.display = 'none';
        pendingDeleteId = null;
        pendingDeleteTitle = '';
    }

    function confirmDelete() {
        if (!pendingDeleteId) return;

        var sourceId = pendingDeleteId;
        closeDeleteModal();

        fetch('/lectures/' + encodeURIComponent(sourceId), {
            method: 'DELETE'
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                showToast('Lecture deleted.');
                if (isDashboardVisible) fetchLectures();
            } else {
                showToast(data.error || 'Delete failed.');
            }
        })
        .catch(function () {
            showToast('Could not connect to server.');
        });
    }


    function retryLecture(sourceId) {
        fetch('/lectures/' + encodeURIComponent(sourceId) + '/retry', {
            method: 'POST'
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                showToast('Retrying lecture processing...');
                isUploadActive = true;
                currentUploadSourceId = sourceId;
                showUploadPanel(pendingDeleteTitle || sourceId, 'uploading');
                startStatusPolling(pendingDeleteTitle || sourceId);
                if (isDashboardVisible) fetchLectures();
            } else {
                showToast(data.error || 'Retry failed.');
            }
        })
        .catch(function () {
            showToast('Could not connect to server.');
        });
    }


    function buildCardShell(question) {
        var card = document.createElement('div');
        card.className = 'result-card';
        var q = document.createElement('div');
        q.className = 'result-q';
        q.innerHTML = '<div class="result-q-icon">' + ICON.search + '</div>' +
                      '<div class="result-q-text">' + escapeHtml(question) + '</div>';
        card.appendChild(q);
        return card;
    }

    function buildSkeleton() {
        var el = document.createElement('div');
        el.className = 'skeleton-body';
        el.innerHTML =
            '<div class="skeleton-lines">' +
                '<div class="skeleton-line"></div>' +
                '<div class="skeleton-line"></div>' +
                '<div class="skeleton-line"></div>' +
            '</div>' +
            '<div class="skeleton-status">' +
                '<div class="skeleton-dots"><span></span><span></span><span></span></div>' +
                '<span class="skeleton-status-text">' + PHASES[0].text + '</span>' +
            '</div>';
        return el;
    }

    function startPhases(skeleton) {
        var txt = skeleton.querySelector('.skeleton-status-text');
        var timers = [];
        for (var i = 1; i < PHASES.length; i++) {
            (function (p) {
                timers.push(setTimeout(function () {
                    if (txt && skeleton.parentNode) txt.textContent = p.text;
                }, p.at));
            })(PHASES[i]);
        }
        return timers;
    }

    function clearAll_timers(t) { t.forEach(function (id) { clearTimeout(id); }); }

    function fadeOutSkeleton(el, cb) {
        el.style.transition = 'opacity 200ms ease, transform 200ms ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-4px)';
        setTimeout(function () { el.remove(); if (cb) cb(); }, 200);
    }

    function buildAnswer(answer) {
        var el = document.createElement('div');
        el.className = 'result-a';
        el.innerHTML =
            '<div class="result-a-label"><div class="result-a-dot"></div><span>Answer</span></div>' +
            '<div class="result-a-text">' + escapeHtml(answer) + '</div>';
        return el;
    }

    function buildFooter(answer, timeOverride) {
        var f = document.createElement('div');
        f.className = 'result-foot';
        var time = timeOverride || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        var uid = 'cp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
        f.innerHTML =
            '<span class="result-time">' + time + '</span>' +
            '<button class="btn-copy" id="' + uid + '" title="Copy answer">' + ICON.copy + ' Copy</button>';
        setTimeout(function () {
            var btn = document.getElementById(uid);
            if (btn) btn.addEventListener('click', function () { copyText(answer, btn); });
        }, 0);
        return f;
    }

    function buildError(msg) {
        var el = document.createElement('div');
        el.className = 'result-a';
        el.innerHTML =
            '<div class="error-label">' + ICON.alert + '<span>Error</span></div>' +
            '<div class="error-text">' + escapeHtml(msg) + '</div>';
        return el;
    }


    function toggleSidebar() {
        document.body.classList.toggle('sidebar-open');
    }

    function closeSidebar() {
        document.body.classList.remove('sidebar-open');
    }

    function newQuestion() {
        if (isProcessing) return;
        activeChatId = null;
        saveChatsToStorage();
        renderHistory();
        renderActiveChatMessages();
        if (isDashboardVisible) showSearch();
        input.value = '';
        input.style.height = 'auto';
        input.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.innerWidth < 1024) closeSidebar();
    }

    function selectChat(chatId) {
        if (isProcessing) return;
        activeChatId = chatId;
        saveChatsToStorage();
        renderHistory();
        renderActiveChatMessages();
        if (isDashboardVisible) showSearch();
        if (window.innerWidth < 1024) closeSidebar();
    }

    function renderActiveChatMessages() {
        results.innerHTML = '';
        var activeChat = getActiveChat();

        if (!activeChat || !activeChat.messages || activeChat.messages.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'flex';
                results.appendChild(emptyState);
            }
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        activeChat.messages.forEach(function (msg) {
            var card = buildCardShell(msg.question);
            if (msg.answer) {
                card.appendChild(buildAnswer(msg.answer));
                card.appendChild(buildFooter(msg.answer, msg.time));
            } else if (msg.error) {
                card.classList.add('is-error');
                card.appendChild(buildError(msg.error));
            }
            results.appendChild(card);
        });

        scrollToBottom();
    }

    function renderHistory() {
        sidebarList.innerHTML = '';
        if (chats.length === 0) {
            sidebarEmpty.style.display = 'block';
            return;
        }
        sidebarEmpty.style.display = 'none';

        chats.forEach(function (chat) {
            var item = document.createElement('div');
            var isActive = (chat.id === activeChatId);
            item.className = 'sidebar-item sidebar-text' + (isActive ? ' is-active' : '');
            item.textContent = chat.title;
            item.title = chat.title;
            item.setAttribute('data-chat-id', chat.id);
            item.addEventListener('click', function () {
                selectChat(chat.id);
            });
            sidebarList.appendChild(item);
        });
    }

    function clearAll() {
        results.innerHTML = '';
        chats = [];
        activeChatId = null;
        saveChatsToStorage();
        renderHistory();
        if (emptyState) {
            emptyState.style.display = 'flex';
            results.appendChild(emptyState);
        }
        if (isDashboardVisible) showSearch();
        if (window.innerWidth < 1024) closeSidebar();
        showToast('History cleared.');
    }


    function setProcessing(state) {
        isProcessing = state;
        askBtn.disabled = state;
        input.disabled = state;
        if (state) askBtn.classList.add('is-loading');
        else       askBtn.classList.remove('is-loading');
    }

    function copyText(text, btn) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { showCopied(btn); });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); showCopied(btn); }
            catch (e) { showToast('Failed to copy.'); }
            document.body.removeChild(ta);
        }
    }

    function showCopied(btn) {
        var orig = btn.innerHTML;
        btn.classList.add('is-copied');
        btn.innerHTML = ICON.check + ' Copied';
        setTimeout(function () { btn.classList.remove('is-copied'); btn.innerHTML = orig; }, 1800);
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.className = 'toast';
        void toast.offsetWidth;
        toast.classList.add('is-visible');
        setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
    }

    function scrollToBottom() {
        setTimeout(function () {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 60);
    }

    function escapeHtml(text) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(text));
        return d.innerHTML;
    }


    var isResizing = false;

    resizeHandle.addEventListener('mousedown', function (e) {
        if (!document.body.classList.contains('sidebar-open')) return;
        isResizing = true;
        document.body.classList.add('is-resizing');
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (!isResizing) return;
        var newWidth = Math.min(400, Math.max(200, e.clientX));
        document.documentElement.style.setProperty('--sidebar-w', newWidth + 'px');
    });

    document.addEventListener('mouseup', function () {
        if (!isResizing) return;
        isResizing = false;
        document.body.classList.remove('is-resizing');
        var w = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w').trim();
        localStorage.setItem('lecturelens-sidebar-width', w);
    });

    loadChatsFromStorage();
    renderHistory();
    renderActiveChatMessages();

})();
