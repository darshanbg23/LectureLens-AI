document.addEventListener('DOMContentLoaded', () => {
    const headerCourseName = document.getElementById('header-course-name');
    const sidebarCourseName = document.getElementById('sidebar-course-name');
    const breadcrumbLecture = document.getElementById('breadcrumb-lecture');
    const breadcrumbLectureSep = document.getElementById('breadcrumb-lecture-sep');
    const categoryVideos = document.getElementById('category-videos');
    const videosCountBadge = document.getElementById('videosCountBadge');
    const videoTitleHeader = document.getElementById('videoTitleHeader');
    const statusBadge = document.getElementById('statusBadge');
    const durationMeta = document.getElementById('durationMeta');
    const videoDurationHeader = document.getElementById('videoDurationHeader');
    const mainVideo = document.getElementById('mainVideo');
    const videoEmptyState = document.getElementById('videoEmptyState');
    const videoControlsBar = document.getElementById('videoControlsBar');
    const videoViewerContainer = document.getElementById('videoViewerContainer');

    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const skipBackBtn = document.getElementById('skipBackBtn');
    const skipFwdBtn = document.getElementById('skipFwdBtn');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeIconHigh = document.getElementById('volumeIconHigh');
    const volumeIconLow = document.getElementById('volumeIconLow');
    const volumeIconMuted = document.getElementById('volumeIconMuted');
    const volumeTrack = document.getElementById('volumeTrack');
    const volumeBar = document.getElementById('volumeBar');
    const volumeThumb = document.getElementById('volumeThumb');
    const scrubberTrack = document.getElementById('scrubberTrack');
    const videoProgressBar = document.getElementById('videoProgressBar');
    const videoThumb = document.getElementById('videoThumb');
    const videoBufferBar = document.getElementById('videoBufferBar');
    const playerTimestamp = document.getElementById('playerTimestamp');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fullscreenIcon = document.getElementById('fullscreenIcon');
    const exitFullscreenIcon = document.getElementById('exitFullscreenIcon');

    const toggleMaterialsBtn = document.getElementById('toggleMaterialsBtn');
    const toggleViewerBtn = document.getElementById('toggleViewerBtn');
    const toggleAiBtn = document.getElementById('toggleAiBtn');
    const closeAiPanelBtn = document.getElementById('closeAiPanelBtn');
    const leftSidebar = document.getElementById('leftSidebar');
    const centerViewerPanel = document.getElementById('centerViewerPanel');
    const rightSidebar = document.getElementById('rightSidebar');

    const addMaterialBtn = document.getElementById('addMaterialBtn');
    const videoFileInput = document.getElementById('videoFileInput');

    const uploadStatusEl = document.getElementById('uploadStatus');
    const uploadStatusText = document.getElementById('uploadStatusText');

    const tabBtnChapters = document.getElementById('tabBtnChapters');
    const tabBtnTranscript = document.getElementById('tabBtnTranscript');
    const tabBtnNotes = document.getElementById('tabBtnNotes');
    const tabContentChapters = document.getElementById('tabContentChapters');
    const tabContentTranscript = document.getElementById('tabContentTranscript');
    const tabContentNotes = document.getElementById('tabContentNotes');
    const transcriptEmptyState = document.getElementById('transcriptEmptyState');

    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatHistory = document.getElementById('chatHistory');
    const newChatBtn = document.getElementById('newChatBtn');
    const historyChatBtn = document.getElementById('historyChatBtn');
    const pastConversationsPanel = document.getElementById('pastConversationsPanel');
    const pastConversationsList = document.getElementById('pastConversationsList');
    const pastConversationsCount = document.getElementById('pastConversationsCount');

    let currentChatId = null;
    let currentLecture = null;
    let allReadyLectures = [];
    let courseName = '';
    let uploadPollTimer = null;

    let activeUploadXhr = null;
    let activeUploadSourceId = null;
    let isUploadMinimized = false;
    let uploadObjectUrl = null;

    const floatingUploadPanel = document.getElementById('floatingUploadPanel');
    const compactUploadIndicator = document.getElementById('compactUploadIndicator');
    const minimizeUploadBtn = document.getElementById('minimizeUploadBtn');
    const uploadPanelFilename = document.getElementById('uploadPanelFilename');
    const uploadPanelStatusText = document.getElementById('uploadPanelStatusText');
    const wizardLine = document.getElementById('wizardLine');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const uploadPanelThumb = document.getElementById('uploadPanelThumb');
    const uploadPanelThumbPlaceholder = document.getElementById('uploadPanelThumbPlaceholder');
    const compactUploadText = document.getElementById('compactUploadText');

    const stage1Icon = document.getElementById('stage1Icon');
    const stage2Icon = document.getElementById('stage2Icon');
    const stage3Icon = document.getElementById('stage3Icon');
    const stage4Icon = document.getElementById('stage4Icon');

    const miniStage1Icon = document.getElementById('miniStage1Icon');
    const miniStage2Icon = document.getElementById('miniStage2Icon');
    const miniStage3Icon = document.getElementById('miniStage3Icon');
    const miniStage1Text = document.getElementById('miniStage1Text');
    const miniStage2Text = document.getElementById('miniStage2Text');
    const miniStage3Text = document.getElementById('miniStage3Text');

    const iconCompleted = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    const iconUploading = `<svg class="w-3.5 h-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`;
    const iconProcessing = `<svg class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>`;
    const iconIndexing = `<svg class="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`;

    function resetWizard() {
        if (!stage1Icon) return;
        const defaultClass = "w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 text-slate-500 flex items-center justify-center ring-4 ring-[#131B2E]";
        const activeClass = "w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center ring-4 ring-[#131B2E] shadow shadow-brand-500/50";

        [stage1Icon, stage2Icon, stage3Icon, stage4Icon].forEach(el => el.className = defaultClass);

        wizardLine.style.width = '0%';

        stage1Icon.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`;
        stage2Icon.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>`;
        stage3Icon.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>`;
        stage4Icon.innerHTML = iconCompleted;
    }

    function setStage(stage) {
        if (!stage1Icon) return;
        const activeClass = "w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center ring-4 ring-[#131B2E] shadow-sm shadow-brand-500/50";
        const completedClass = "w-6 h-6 rounded-full bg-brand-600 border border-brand-400 text-white flex items-center justify-center ring-4 ring-[#131B2E]";

        const miniPendingSvg = `<svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="3"></circle></svg>`;
        const miniActiveSvg = `<svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>`;
        const miniCompletedSvg = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
        const miniFailedSvg = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>`;

        if (miniStage1Icon) {
            [miniStage1Icon, miniStage2Icon, miniStage3Icon].forEach(el => el.innerHTML = miniPendingSvg);
            [miniStage1Icon, miniStage2Icon, miniStage3Icon].forEach(el => el.className = "w-3 h-3 flex items-center justify-center text-slate-500");
            [miniStage1Text, miniStage2Text, miniStage3Text].forEach(el => el.className = "text-slate-500");
        }

        if (stage === 'uploading') {
            stage1Icon.className = activeClass;
            stage1Icon.innerHTML = iconUploading;
            wizardLine.style.width = '0%';

            if (miniStage1Icon) {
                miniStage1Icon.innerHTML = miniActiveSvg;
                miniStage1Icon.className = "w-3 h-3 flex items-center justify-center text-brand-400";
                miniStage1Text.className = "text-slate-200 font-semibold";
            }
        } else if (stage === 'processing') {
            stage1Icon.className = completedClass;
            stage1Icon.innerHTML = iconCompleted;
            stage2Icon.className = activeClass;
            stage2Icon.innerHTML = iconProcessing;
            wizardLine.style.width = '33%';

            if (miniStage1Icon) {
                miniStage1Icon.innerHTML = miniCompletedSvg;
                miniStage1Icon.className = "w-3 h-3 flex items-center justify-center text-emerald-400";
                miniStage1Text.className = "text-slate-400";
                miniStage2Icon.innerHTML = miniActiveSvg;
                miniStage2Icon.className = "w-3 h-3 flex items-center justify-center text-brand-400";
                miniStage2Text.className = "text-slate-200 font-semibold";
            }
        } else if (stage === 'indexing') {
            stage2Icon.className = completedClass;
            stage2Icon.innerHTML = iconCompleted;
            stage3Icon.className = activeClass;
            stage3Icon.innerHTML = iconIndexing;
            wizardLine.style.width = '66%';

            if (miniStage1Icon) {
                miniStage1Icon.innerHTML = miniCompletedSvg;
                miniStage1Icon.className = "w-3 h-3 flex items-center justify-center text-emerald-400";
                miniStage1Text.className = "text-slate-400";
                miniStage2Icon.innerHTML = miniCompletedSvg;
                miniStage2Icon.className = "w-3 h-3 flex items-center justify-center text-emerald-400";
                miniStage2Text.className = "text-slate-400";
                miniStage3Icon.innerHTML = miniActiveSvg;
                miniStage3Icon.className = "w-3 h-3 flex items-center justify-center text-brand-400";
                miniStage3Text.className = "text-slate-200 font-semibold";
            }
        } else if (stage === 'ready') {
            stage3Icon.className = completedClass;
            stage3Icon.innerHTML = iconCompleted;
            stage4Icon.className = activeClass;
            stage4Icon.innerHTML = iconCompleted;
            wizardLine.style.width = '100%';

            if (miniStage1Icon) {
                [miniStage1Icon, miniStage2Icon, miniStage3Icon].forEach(el => {
                    el.innerHTML = miniCompletedSvg;
                    el.className = "w-3 h-3 flex items-center justify-center text-emerald-400";
                });
                [miniStage1Text, miniStage2Text, miniStage3Text].forEach(el => el.className = "text-slate-400");
            }
        } else if (stage === 'failed' || stage === 'cancelled') {
            if (miniStage1Icon) {
                if (wizardLine.style.width === '0%') {
                    miniStage1Icon.innerHTML = miniFailedSvg;
                    miniStage1Icon.className = "w-3 h-3 flex items-center justify-center text-red-400";
                    miniStage1Text.className = "text-red-400 font-semibold";
                } else if (wizardLine.style.width === '33%') {
                    miniStage1Icon.innerHTML = miniCompletedSvg;
                    miniStage1Icon.className = "w-3 h-3 flex items-center justify-center text-emerald-400";
                    miniStage2Icon.innerHTML = miniFailedSvg;
                    miniStage2Icon.className = "w-3 h-3 flex items-center justify-center text-red-400";
                    miniStage2Text.className = "text-red-400 font-semibold";
                } else if (wizardLine.style.width === '66%') {
                    miniStage1Icon.innerHTML = miniCompletedSvg;
                    miniStage1Icon.className = "w-3 h-3 flex items-center justify-center text-emerald-400";
                    miniStage2Icon.innerHTML = miniCompletedSvg;
                    miniStage2Icon.className = "w-3 h-3 flex items-center justify-center text-emerald-400";
                    miniStage3Icon.innerHTML = miniFailedSvg;
                    miniStage3Icon.className = "w-3 h-3 flex items-center justify-center text-red-400";
                    miniStage3Text.className = "text-red-400 font-semibold";
                }
            }
        }
    }

    if (minimizeUploadBtn && floatingUploadPanel && compactUploadIndicator) {
        minimizeUploadBtn.addEventListener('click', () => {
            isUploadMinimized = true;
            floatingUploadPanel.classList.add('hidden');
            compactUploadIndicator.classList.remove('hidden');
        });

        compactUploadIndicator.addEventListener('click', (e) => {
            if (e.target.closest('#compactCancelBtn')) return;
            isUploadMinimized = false;
            compactUploadIndicator.classList.add('hidden');
            floatingUploadPanel.classList.remove('hidden');
        });
    }

    const compactCancelBtn = document.getElementById('compactCancelBtn');
    if (compactCancelBtn) {
        compactCancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelActiveUpload();
        });
    }

    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', () => {
            cancelActiveUpload();
        });
    }

    function cancelActiveUpload() {
        if (activeUploadXhr) {
            activeUploadXhr.abort();
            activeUploadXhr = null;
            finishUploadUI();
            fetchLectures();
        } else if (activeUploadSourceId) {
            fetch('/lectures/' + activeUploadSourceId + '/cancel', { method: 'POST' })
                .then(() => {
                    finishUploadUI();
                    fetchLectures();
                });
        } else {
            finishUploadUI();
        }
    }

    function finishUploadUI() {
        if (floatingUploadPanel) floatingUploadPanel.classList.add('hidden');
        if (compactUploadIndicator) compactUploadIndicator.classList.add('hidden');
        if (uploadStatusEl) uploadStatusEl.classList.add('hidden');
        if (uploadPollTimer) {
            clearInterval(uploadPollTimer);
            uploadPollTimer = null;
        }
        activeUploadSourceId = null;
        isUploadMinimized = false;
        if (uploadObjectUrl) {
            URL.revokeObjectURL(uploadObjectUrl);
            uploadObjectUrl = null;
        }
    }

    function updateProgressUI(text, stage) {
        if (uploadPanelStatusText) uploadPanelStatusText.textContent = text;
        if (compactUploadText) compactUploadText.textContent = text;

        const compactSpinner = document.getElementById('compactSpinner');
        const compactReadyIcon = document.getElementById('compactReadyIcon');
        const compactErrorIcon = document.getElementById('compactErrorIcon');

        if (stage === 'ready') {
            if (compactSpinner) compactSpinner.classList.add('hidden');
            if (compactErrorIcon) compactErrorIcon.classList.add('hidden');
            if (compactReadyIcon) compactReadyIcon.classList.remove('hidden');
        } else if (stage === 'failed' || stage === 'cancelled') {
            if (compactSpinner) compactSpinner.classList.add('hidden');
            if (compactReadyIcon) compactReadyIcon.classList.add('hidden');
            if (compactErrorIcon) compactErrorIcon.classList.remove('hidden');
        } else {
            if (compactSpinner) compactSpinner.classList.remove('hidden');
            if (compactReadyIcon) compactReadyIcon.classList.add('hidden');
            if (compactErrorIcon) compactErrorIcon.classList.add('hidden');
        }

        setStage(stage);
    }

    function formatTime(sec) {
        if (!sec || isNaN(sec)) return '00:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    fetch('/courses')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const course = data.courses.find(c => c.course_id === COURSE_ID);
                if (course) {
                    courseName = course.name;
                    if (headerCourseName) headerCourseName.textContent = course.name;
                    if (sidebarCourseName) sidebarCourseName.textContent = course.name;
                } else {
                    if (headerCourseName) headerCourseName.textContent = 'Unknown Course';
                    if (sidebarCourseName) sidebarCourseName.textContent = 'Unknown Course';
                }
                initChatPersistence();
            }
        })
        .catch(() => {
            if (headerCourseName) headerCourseName.textContent = 'Error loading';
            initChatPersistence();
        });

    function fetchLectures() {
        fetch('/lectures?course_id=' + COURSE_ID)
            .then(res => res.json())
            .then(data => {
                if (data.success && categoryVideos) {
                    categoryVideos.innerHTML = '';
                    const readyLectures = data.lectures.filter(l => l.status === 'ready');
                    allReadyLectures = readyLectures;
                    updatePrevNextButtons();
                    const processingLectures = data.lectures.filter(l =>
                        ['uploading', 'processing', 'indexing'].includes(l.status)
                    );

                    if (videosCountBadge) videosCountBadge.textContent = readyLectures.length + processingLectures.length;

                    if (readyLectures.length === 0 && processingLectures.length === 0) {
                        categoryVideos.innerHTML = '<div class="text-slate-500 italic px-2.5 py-1.5">No lectures yet</div>';
                    }

                    readyLectures.forEach(lec => {
                        const el = document.createElement('a');
                        el.href = '#';
                        const isCurrent = currentLecture && currentLecture.source_id === lec.source_id;
                        el.className = isCurrent
                            ? 'flex items-center justify-between px-2.5 py-1.5 rounded-md bg-brand-600/25 text-white border border-brand-500/60 shadow-sm shadow-brand-900/30 font-medium'
                            : 'flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-200 hover:bg-[#141B2D] hover:text-white transition-colors cursor-pointer';
                        el.dataset.sourceId = lec.source_id;
                        el.innerHTML = `<span class="truncate">Lecture ${lec.number} - ${lec.title}</span>`;
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            selectLecture(lec, el);
                        });
                        categoryVideos.appendChild(el);
                    });

                    processingLectures.forEach(lec => {
                        const el = document.createElement('a');
                        el.href = '#';
                        const isCurrent = currentLecture && currentLecture.source_id === lec.source_id;
                        el.className = isCurrent
                            ? 'flex items-center justify-between px-2.5 py-1.5 rounded-md bg-brand-600/25 text-white border border-brand-500/60 shadow-sm shadow-brand-900/30 font-medium'
                            : 'flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-300 hover:bg-[#141B2D] hover:text-white transition-colors cursor-pointer group/proc';
                        el.dataset.sourceId = lec.source_id;
                        el.innerHTML = `
                            <span class="truncate text-sm">Lecture ${lec.number} - ${lec.title}</span>
                            <div class="flex items-center gap-2 shrink-0 ml-2">
                                <span class="text-[10px] text-brand-300 font-mono">${lec.status}</span>
                                <button class="sidebar-cancel-btn text-[10px] text-red-400/70 hover:text-red-300 font-medium transition-colors px-1 py-0.5 rounded hover:bg-red-400/10" data-source-id="${lec.source_id}" title="Cancel processing">
                                    ✕
                                </button>
                            </div>
                        `;
                        el.addEventListener('click', (e) => {
                            if (e.target.closest('.sidebar-cancel-btn')) return;
                            e.preventDefault();
                            selectLecture(lec, el);
                        });
                        categoryVideos.appendChild(el);
                    });

                    categoryVideos.querySelectorAll('.sidebar-cancel-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const sourceId = btn.dataset.sourceId;
                            if (!sourceId) return;
                            btn.disabled = true;
                            btn.textContent = '...';
                            fetch('/lectures/' + sourceId + '/cancel', { method: 'POST' })
                                .then(res => res.json())
                                .then(data => {
                                    if (data.success) {
                                        if (activeUploadSourceId === sourceId) {
                                            finishUploadUI();
                                        }
                                        setTimeout(fetchLectures, 1500);
                                    } else {
                                        btn.textContent = '✕';
                                        btn.disabled = false;
                                    }
                                })
                                .catch(() => {
                                    btn.textContent = '✕';
                                    btn.disabled = false;
                                });
                        });
                    });
                }
            });
    }

    fetchLectures();

    function detectActiveProcessing() {
        fetch('/upload/status')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.status !== 'idle' && data.source_id) {
                    activeUploadSourceId = data.source_id;
                    const filename = (data.lecture_title || 'video') + '.mp4';

                    resetWizard();
                    const compactUploadFilename = document.getElementById('compactUploadFilename');
                    if (compactUploadFilename) compactUploadFilename.textContent = filename;
                    if (uploadPanelFilename) uploadPanelFilename.textContent = filename;

                    let stageText = 'Processing...';
                    if (data.status === 'uploading') stageText = 'Saving to disk...';
                    else if (data.status === 'processing') stageText = 'Transcribing audio...';
                    else if (data.status === 'indexing') stageText = 'Building search index...';

                    updateProgressUI(stageText, data.status);

                    isUploadMinimized = true;
                    if (compactUploadIndicator) compactUploadIndicator.classList.remove('hidden');
                    if (uploadStatusEl) uploadStatusEl.classList.remove('hidden');
                    if (uploadStatusText) uploadStatusText.textContent = 'Processing: ' + data.status + '...';

                    startUploadPolling();
                }
            })
            .catch(() => { });
    }

    if (!activeUploadXhr) {
        detectActiveProcessing();
    }

    function selectLecture(lec, el) {
        currentLecture = lec;
        updatePrevNextButtons();

        if (videoTitleHeader) videoTitleHeader.textContent = 'Lecture ' + lec.number + ' - ' + lec.title;

        if (statusBadge) statusBadge.classList.remove('hidden');

        if (breadcrumbLecture) {
            breadcrumbLecture.textContent = 'Lecture ' + lec.number;
            breadcrumbLecture.classList.remove('hidden');
        }
        if (breadcrumbLectureSep) breadcrumbLectureSep.classList.remove('hidden');

        if (categoryVideos) {
            Array.from(categoryVideos.querySelectorAll('a')).forEach(a => {
                a.className = 'flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-200 hover:bg-[#141B2D] hover:text-white transition-colors cursor-pointer';
            });
        }
        if (el) {
            el.className = 'flex items-center justify-between px-2.5 py-1.5 rounded-md bg-brand-600/25 text-white border border-brand-500/60 shadow-sm shadow-brand-900/30 font-medium';
        }

        loadVideo(lec.source_id);

        loadTranscript(lec.source_id);
    }

    function updatePrevNextButtons() {
        if (!prevBtn || !nextBtn) return;
        if (!currentLecture || allReadyLectures.length === 0) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        const idx = allReadyLectures.findIndex(l => l.source_id === currentLecture.source_id);
        if (idx === -1) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        prevBtn.disabled = (idx <= 0);

        nextBtn.disabled = (idx >= allReadyLectures.length - 1);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (prevBtn.disabled || !currentLecture || allReadyLectures.length === 0) return;
            const idx = allReadyLectures.findIndex(l => l.source_id === currentLecture.source_id);
            if (idx > 0) {
                const prevLec = allReadyLectures[idx - 1];
                const el = categoryVideos ? categoryVideos.querySelector(`[data-source-id="${prevLec.source_id}"]`) : null;
                selectLecture(prevLec, el);
                if (mainVideo) {
                    mainVideo.addEventListener('canplay', () => {
                        mainVideo.play().catch(() => {});
                    }, { once: true });
                }
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (nextBtn.disabled || !currentLecture || allReadyLectures.length === 0) return;
            const idx = allReadyLectures.findIndex(l => l.source_id === currentLecture.source_id);
            if (idx >= 0 && idx < allReadyLectures.length - 1) {
                const nextLec = allReadyLectures[idx + 1];
                const el = categoryVideos ? categoryVideos.querySelector(`[data-source-id="${nextLec.source_id}"]`) : null;
                selectLecture(nextLec, el);
                if (mainVideo) {
                    mainVideo.addEventListener('canplay', () => {
                        mainVideo.play().catch(() => {});
                    }, { once: true });
                }
            }
        });
    }

    function loadVideo(sourceId) {
        if (!mainVideo) return;

        const videoUrl = '/lectures/' + sourceId + '/video';
        mainVideo.src = videoUrl;
        mainVideo.load();

        mainVideo.classList.remove('hidden');
        if (videoEmptyState) videoEmptyState.style.display = 'none';
        if (videoControlsBar) videoControlsBar.style.display = '';

        updateVolumeUI();
        updatePrevNextButtons();
    }

    if (mainVideo) {
        mainVideo.addEventListener('loadedmetadata', () => {
            const dur = mainVideo.duration;
            if (playerTimestamp) playerTimestamp.textContent = '00:00 / ' + formatTime(dur);
            if (videoDurationHeader) videoDurationHeader.textContent = formatTime(dur);
            if (durationMeta) durationMeta.style.display = '';
            updateVolumeUI();
        });

        mainVideo.addEventListener('timeupdate', () => {
            if (isDraggingScrubber) return;
            const cur = mainVideo.currentTime;
            const dur = mainVideo.duration;
            if (!dur) return;

            const pct = (cur / dur) * 100;
            if (videoProgressBar) videoProgressBar.style.width = pct + '%';
            if (videoThumb) videoThumb.style.left = pct + '%';
            if (playerTimestamp) playerTimestamp.textContent = formatTime(cur) + ' / ' + formatTime(dur);
        });

        mainVideo.addEventListener('progress', () => {
            if (mainVideo.buffered.length > 0) {
                const bufferedEnd = mainVideo.buffered.end(mainVideo.buffered.length - 1);
                const dur = mainVideo.duration;
                if (dur > 0 && videoBufferBar) {
                    videoBufferBar.style.width = (bufferedEnd / dur) * 100 + '%';
                }
            }
        });

        mainVideo.addEventListener('play', () => {
            if (playIcon) playIcon.classList.add('hidden');
            if (pauseIcon) pauseIcon.classList.remove('hidden');
        });

        mainVideo.addEventListener('pause', () => {
            if (playIcon) playIcon.classList.remove('hidden');
            if (pauseIcon) pauseIcon.classList.add('hidden');
        });

        mainVideo.addEventListener('error', () => {
            if (videoEmptyState) {
                videoEmptyState.style.display = '';
                const p = videoEmptyState.querySelector('p');
                if (p) p.textContent = 'Failed to load video';
            }
            mainVideo.classList.add('hidden');
            if (videoControlsBar) videoControlsBar.style.display = 'none';
        });
    }

    function togglePlayPause() {
        if (!mainVideo) return;
        if (mainVideo.paused) {
            mainVideo.play().catch(() => {});
        } else {
            mainVideo.pause();
        }
    }

    if (playPauseBtn && mainVideo) {
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlayPause();
        });
    }

    if (skipBackBtn && mainVideo) {
        skipBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 10);
        });
    }
    if (skipFwdBtn && mainVideo) {
        skipFwdBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mainVideo.currentTime = Math.min(mainVideo.duration || 0, mainVideo.currentTime + 10);
        });
    }

    let videoClickTimeout = null;
    if (mainVideo) {
        mainVideo.addEventListener('click', (e) => {
            e.stopPropagation();
            if (videoClickTimeout) {
                clearTimeout(videoClickTimeout);
                videoClickTimeout = null;
                return;
            }
            videoClickTimeout = setTimeout(() => {
                videoClickTimeout = null;
                togglePlayPause();
            }, 240);
        });

        mainVideo.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (videoClickTimeout) {
                clearTimeout(videoClickTimeout);
                videoClickTimeout = null;
            }
            toggleFullscreen();
        });
    }

    if (videoViewerContainer) {
        videoViewerContainer.addEventListener('click', () => {
            videoViewerContainer.focus();
        });
    }

    let isDraggingVolume = false;
    let lastVolume = 1;

    function updateVolumeUI() {
        if (!mainVideo || !volumeBar) return;
        const isMuted = mainVideo.muted || mainVideo.volume === 0;
        const vol = isMuted ? 0 : mainVideo.volume;
        const pct = Math.round(vol * 100);

        volumeBar.style.width = pct + '%';
        if (volumeThumb) {
            volumeThumb.style.left = pct + '%';
        }

        if (volumeIconHigh && volumeIconLow && volumeIconMuted) {
            volumeIconHigh.classList.add('hidden');
            volumeIconLow.classList.add('hidden');
            volumeIconMuted.classList.add('hidden');

            if (isMuted || vol === 0) {
                volumeIconMuted.classList.remove('hidden');
                if (volumeBtn) volumeBtn.setAttribute('title', 'Unmute (M)');
            } else if (vol < 0.5) {
                volumeIconLow.classList.remove('hidden');
                if (volumeBtn) volumeBtn.setAttribute('title', 'Mute (M)');
            } else {
                volumeIconHigh.classList.remove('hidden');
                if (volumeBtn) volumeBtn.setAttribute('title', 'Mute (M)');
            }
        }
    }

    function toggleMute() {
        if (!mainVideo) return;
        if (mainVideo.muted || mainVideo.volume === 0) {
            mainVideo.muted = false;
            if (mainVideo.volume === 0) {
                mainVideo.volume = (lastVolume > 0 ? lastVolume : 1);
            }
        } else {
            lastVolume = mainVideo.volume > 0 ? mainVideo.volume : 1;
            mainVideo.muted = true;
        }
        updateVolumeUI();
    }

    if (volumeBtn && mainVideo) {
        volumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMute();
        });
    }

    function setVolumeFromEvent(e) {
        if (!volumeTrack || !mainVideo) return;
        const rect = volumeTrack.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        mainVideo.volume = pct;
        mainVideo.muted = (pct === 0);
        if (pct > 0) lastVolume = pct;
        updateVolumeUI();
    }

    if (volumeTrack && mainVideo) {
        volumeTrack.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isDraggingVolume = true;
            volumeTrack.classList.add('is-dragging');
            setVolumeFromEvent(e);
        });
        volumeTrack.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            isDraggingVolume = true;
            volumeTrack.classList.add('is-dragging');
            setVolumeFromEvent(e);
        }, { passive: true });
    }

    let isDraggingScrubber = false;

    function setScrubberFromEvent(e, commit = false) {
        if (!scrubberTrack || !mainVideo || !mainVideo.duration) return;
        const rect = scrubberTrack.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

        if (videoProgressBar) videoProgressBar.style.width = (pct * 100) + '%';
        if (videoThumb) videoThumb.style.left = (pct * 100) + '%';
        if (playerTimestamp) {
            const previewTime = pct * mainVideo.duration;
            playerTimestamp.textContent = formatTime(previewTime) + ' / ' + formatTime(mainVideo.duration);
        }

        if (commit || isDraggingScrubber) {
            mainVideo.currentTime = pct * mainVideo.duration;
        }
    }

    if (scrubberTrack && mainVideo) {
        scrubberTrack.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isDraggingScrubber = true;
            scrubberTrack.classList.add('is-scrubbing');
            setScrubberFromEvent(e, true);
        });
        scrubberTrack.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            isDraggingScrubber = true;
            scrubberTrack.classList.add('is-scrubbing');
            setScrubberFromEvent(e, true);
        }, { passive: true });
    }

    window.addEventListener('mousemove', (e) => {
        if (isDraggingVolume) {
            setVolumeFromEvent(e);
        }
        if (isDraggingScrubber) {
            setScrubberFromEvent(e, false);
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (isDraggingVolume) {
            isDraggingVolume = false;
            if (volumeTrack) volumeTrack.classList.remove('is-dragging');
        }
        if (isDraggingScrubber) {
            setScrubberFromEvent(e, true);
            isDraggingScrubber = false;
            if (scrubberTrack) scrubberTrack.classList.remove('is-scrubbing');
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (isDraggingVolume) setVolumeFromEvent(e);
        if (isDraggingScrubber) setScrubberFromEvent(e, false);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        if (isDraggingVolume) {
            isDraggingVolume = false;
            if (volumeTrack) volumeTrack.classList.remove('is-dragging');
        }
        if (isDraggingScrubber) {
            isDraggingScrubber = false;
            if (scrubberTrack) scrubberTrack.classList.remove('is-scrubbing');
        }
    });

    document.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        const isInput = activeEl && (
            activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable ||
            (activeEl.closest && activeEl.closest('#chatInput'))
        );
        if (isInput) return;

        if (!mainVideo || !mainVideo.src || mainVideo.classList.contains('hidden')) return;

        switch (e.key) {
            case ' ':
            case 'Spacebar':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                toggleMute();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 5);
                break;
            case 'ArrowRight':
                e.preventDefault();
                mainVideo.currentTime = Math.min(mainVideo.duration || 0, mainVideo.currentTime + 5);
                break;
            case 'ArrowUp':
                e.preventDefault();
                mainVideo.volume = Math.min(1, Math.round((mainVideo.volume + 0.05) * 100) / 100);
                mainVideo.muted = false;
                lastVolume = mainVideo.volume;
                updateVolumeUI();
                break;
            case 'ArrowDown':
                e.preventDefault();
                mainVideo.volume = Math.max(0, Math.round((mainVideo.volume - 0.05) * 100) / 100);
                if (mainVideo.volume === 0) mainVideo.muted = true;
                else lastVolume = mainVideo.volume;
                updateVolumeUI();
                break;
        }
    });

    let fullscreenTimeout;

    function resetFullscreenControls() {
        if (!document.fullscreenElement) return;
        videoViewerContainer.classList.add('controls-active');
        document.body.style.cursor = 'default';
        clearTimeout(fullscreenTimeout);
        fullscreenTimeout = setTimeout(() => {
            if (document.fullscreenElement) {
                videoViewerContainer.classList.remove('controls-active');
                document.body.style.cursor = 'none';
            }
        }, 2500);
    }

    function toggleFullscreen() {
        if (!videoViewerContainer) return;
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        } else {
            videoViewerContainer.requestFullscreen().catch(() => {});
        }
    }

    if (fullscreenBtn && videoViewerContainer) {
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFullscreen();
        });

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                videoViewerContainer.classList.add('controls-active', 'is-fullscreen');
                if (fullscreenIcon) fullscreenIcon.classList.add('hidden');
                if (exitFullscreenIcon) exitFullscreenIcon.classList.remove('hidden');
                fullscreenBtn.setAttribute('title', 'Exit Fullscreen (F)');
                videoViewerContainer.addEventListener('mousemove', resetFullscreenControls);
                videoViewerContainer.addEventListener('click', resetFullscreenControls);
                resetFullscreenControls();
            } else {
                videoViewerContainer.classList.remove('controls-active', 'is-fullscreen');
                if (fullscreenIcon) fullscreenIcon.classList.remove('hidden');
                if (exitFullscreenIcon) exitFullscreenIcon.classList.add('hidden');
                fullscreenBtn.setAttribute('title', 'Fullscreen (F)');
                document.body.style.cursor = 'default';
                videoViewerContainer.removeEventListener('mousemove', resetFullscreenControls);
                videoViewerContainer.removeEventListener('click', resetFullscreenControls);
                clearTimeout(fullscreenTimeout);
            }
        });
    }

    let activeNavId = 0;

    function resolveLecture(sourceId, number, title) {
        if (!allReadyLectures || allReadyLectures.length === 0) return null;

        if (sourceId) {
            const sid = String(sourceId).trim();
            let found = allReadyLectures.find(l => l.source_id === sid);
            if (found) return found;

            const lowerSid = sid.toLowerCase();
            found = allReadyLectures.find(l => l.source_id.toLowerCase() === lowerSid);
            if (found) return found;

            const numMatch = sid.match(/^(\d+)/);
            if (numMatch) {
                const num = numMatch[1].padStart(2, '0');
                found = allReadyLectures.find(l => l.number === num || parseInt(l.number, 10) === parseInt(num, 10));
                if (found) return found;
            }
        }

        if (number) {
            const numStr = String(number).trim().padStart(2, '0');
            let found = allReadyLectures.find(l => l.number === numStr || parseInt(l.number, 10) === parseInt(numStr, 10));
            if (found) return found;
        }

        if (title) {
            const t = String(title).trim().toLowerCase();
            let found = allReadyLectures.find(l => l.title.toLowerCase() === t);
            if (found) return found;

            found = allReadyLectures.find(l => l.title.toLowerCase().includes(t) || t.includes(l.title.toLowerCase()));
            if (found) return found;
        }

        return null;
    }

    function seekAndPlay(video, startSec, navId) {
        if (!video) return;
        if (activeNavId !== navId) return;

        try {
            video.currentTime = startSec;
        } catch (e) {
            console.warn('Error setting currentTime directly:', e);
        }
        video.play().catch(() => {});
    }

    function seekWhenReady(video, startSec, navId) {
        if (!video) return;

        let applied = false;

        function applySeek() {
            if (applied) return;
            if (activeNavId !== navId) return;
            applied = true;
            cleanup();

            try {
                video.currentTime = startSec;
            } catch (e) {
                console.warn('Error applying seek to video:', e);
            }
            video.play().catch(() => {});
        }

        function cleanup() {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('canplay', onCanPlay);
        }

        function onLoadedMetadata() {
            applySeek();
        }

        function onCanPlay() {
            applySeek();
        }

        if (video.readyState >= 1) {
            applySeek();
        } else {
            video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
            video.addEventListener('canplay', onCanPlay, { once: true });

            setTimeout(() => {
                if (!applied && activeNavId === navId && video.readyState >= 1) {
                    applySeek();
                }
            }, 1200);
        }
    }

    function navigateToSource(sourceId, startSec, number, title) {
        const targetTime = isNaN(startSec) || startSec < 0 ? 0 : startSec;
        const navId = ++activeNavId;

        if (centerViewerPanel && centerViewerPanel.classList.contains('hidden')) {
            centerViewerPanel.classList.remove('hidden');
            if (typeof updatePanelLayout === 'function') {
                updatePanelLayout();
            }
        }

        function executeNavigation(targetLec) {
            if (!targetLec) {
                console.warn('Source lecture could not be resolved for navigation:', { sourceId, number, title });
                return;
            }

            const catVideos = document.getElementById('category-videos');
            if (catVideos && catVideos.classList.contains('hidden')) {
                catVideos.classList.remove('hidden');
                const chevron = document.querySelector('[data-target="category-videos"] .category-chevron');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            }

            const isSameLecture = currentLecture && currentLecture.source_id === targetLec.source_id && mainVideo && mainVideo.src && !mainVideo.classList.contains('hidden');

            if (isSameLecture) {
                seekAndPlay(mainVideo, targetTime, navId);
            } else {
                const sidebarEl = categoryVideos ? categoryVideos.querySelector(`[data-source-id="${targetLec.source_id}"]`) : null;
                selectLecture(targetLec, sidebarEl);
                seekWhenReady(mainVideo, targetTime, navId);
            }
        }

        let targetLec = resolveLecture(sourceId, number, title);
        if (targetLec) {
            executeNavigation(targetLec);
        } else {
            fetch('/lectures?course_id=' + COURSE_ID)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.lectures) {
                        allReadyLectures = data.lectures.filter(l => l.status === 'ready');
                        targetLec = resolveLecture(sourceId, number, title);
                        if (targetLec) {
                            executeNavigation(targetLec);
                        } else {
                            console.warn('Could not find lecture video for source:', sourceId || title);
                        }
                    }
                })
                .catch(err => {
                    console.error('Error fetching lectures for source navigation:', err);
                });
        }
    }

    function loadTranscript(sourceId) {
        if (!tabContentTranscript) return;

        tabContentTranscript.innerHTML = '<div class="text-slate-400 text-sm">Loading transcript...</div>';

        fetch('/lectures/' + sourceId + '/transcript')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.transcript) {
                    const transcript = data.transcript;
                    const chunks = transcript.chunks || [];

                    if (chunks.length === 0) {
                        tabContentTranscript.innerHTML = '<div class="text-slate-400 text-sm">No transcript available</div>';
                        return;
                    }

                    tabContentTranscript.innerHTML = '';
                    chunks.forEach((chunk, i) => {
                        const div = document.createElement('div');
                        div.className = 'p-2.5 rounded-lg border border-[#262D40] ' +
                            (i === 0 ? 'bg-[#141B2D]/60' : 'bg-[#141B2D]/40');
                        div.innerHTML = `
                            <span class="font-mono text-[10px] ${i === 0 ? 'text-brand-300' : 'text-slate-400'} font-bold">${formatTime(chunk.start)}</span>
                            <p class="mt-1 ${i === 0 ? 'text-slate-200' : 'text-slate-300'}">${escapeHtml(chunk.english_text)}</p>
                        `;
                        div.style.cursor = 'pointer';
                        div.addEventListener('click', () => {
                            if (mainVideo && mainVideo.duration) {
                                mainVideo.currentTime = chunk.start;
                                mainVideo.play();
                            }
                        });
                        tabContentTranscript.appendChild(div);
                    });
                } else {
                    tabContentTranscript.innerHTML = '<div class="text-slate-400 text-sm">No transcript available</div>';
                }
            })
            .catch(() => {
                tabContentTranscript.innerHTML = '<div class="text-slate-400 text-sm">Failed to load transcript</div>';
            });
    }

    const tabBtns = [tabBtnChapters, tabBtnTranscript, tabBtnNotes];
    const tabContents = [tabContentChapters, tabContentTranscript, tabContentNotes];
    const tabNames = ['chapters', 'transcript', 'notes'];

    function switchMainTab(tab) {
        const activeStyle = 'pb-2.5 text-white border-b-2 border-brand-500 transition-colors flex items-center gap-1.5 focus:outline-none font-semibold';
        const inactiveStyle = 'pb-2.5 text-slate-400 hover:text-white border-b-2 border-transparent transition-colors font-medium focus:outline-none';

        tabBtns.forEach((btn, i) => {
            if (!btn) return;
            btn.className = (tabNames[i] === tab) ? activeStyle : inactiveStyle;
        });

        tabContents.forEach((content, i) => {
            if (!content) return;
            if (tabNames[i] === tab) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }

    tabBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            switchMainTab(btn.dataset.tab);
        });
    });

    function setBtnState(btn, isActive) {
        if (!btn) return;
        if (isActive) {
            btn.className = 'p-1.5 rounded-md text-brand-300 bg-brand-500/20 border border-brand-500/40 hover:bg-brand-500/30 transition-all flex items-center justify-center focus:outline-none shadow-sm';
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.className = 'p-1.5 rounded-md text-slate-400 bg-transparent border border-transparent hover:text-white hover:bg-slate-800/60 transition-all flex items-center justify-center focus:outline-none';
            btn.setAttribute('aria-pressed', 'false');
        }
    }

    function updatePanelLayout() {
        const isLeftVisible = leftSidebar && !leftSidebar.classList.contains('hidden');
        const isViewerVisible = centerViewerPanel && !centerViewerPanel.classList.contains('hidden');
        const isAiVisible = rightSidebar && !rightSidebar.classList.contains('hidden');

        setBtnState(toggleMaterialsBtn, isLeftVisible);
        setBtnState(toggleViewerBtn, isViewerVisible);
        setBtnState(toggleAiBtn, isAiVisible);

        if (!isViewerVisible) {
            if (isAiVisible && !isLeftVisible) {
                if (rightSidebar) {
                    rightSidebar.classList.remove('w-96', 'lg:w-[440px]', 'xl:w-[470px]', 'shrink-0');
                    rightSidebar.classList.add('flex-1');
                }
            } else if (isAiVisible && isLeftVisible) {
                if (rightSidebar) {
                    rightSidebar.classList.remove('w-96', 'lg:w-[440px]', 'xl:w-[470px]', 'shrink-0');
                    rightSidebar.classList.add('flex-1');
                }
                if (leftSidebar) {
                    leftSidebar.classList.remove('flex-1');
                    leftSidebar.classList.add('w-64', 'shrink-0');
                }
            } else if (isLeftVisible && !isAiVisible) {
                if (leftSidebar) {
                    leftSidebar.classList.remove('w-64', 'shrink-0');
                    leftSidebar.classList.add('flex-1');
                }
            }
        } else {
            if (rightSidebar) {
                rightSidebar.classList.remove('flex-1');
                rightSidebar.classList.add('w-96', 'lg:w-[440px]', 'xl:w-[470px]', 'shrink-0');
            }
            if (leftSidebar) {
                leftSidebar.classList.remove('flex-1');
                leftSidebar.classList.add('w-64', 'shrink-0');
            }
        }
    }

    if (toggleMaterialsBtn && leftSidebar) {
        toggleMaterialsBtn.addEventListener('click', () => {
            const isLeftVisible = !leftSidebar.classList.contains('hidden');
            const isViewerVisible = centerViewerPanel && !centerViewerPanel.classList.contains('hidden');
            const isAiVisible = rightSidebar && !rightSidebar.classList.contains('hidden');

            if (isLeftVisible && !isViewerVisible && !isAiVisible) {
                return;
            }
            leftSidebar.classList.toggle('hidden');
            updatePanelLayout();
        });
    }

    if (toggleViewerBtn && centerViewerPanel) {
        toggleViewerBtn.addEventListener('click', () => {
            const isViewerVisible = !centerViewerPanel.classList.contains('hidden');
            const isLeftVisible = leftSidebar && !leftSidebar.classList.contains('hidden');
            const isAiVisible = rightSidebar && !rightSidebar.classList.contains('hidden');

            if (isViewerVisible && !isLeftVisible && !isAiVisible) {
                if (rightSidebar) {
                    rightSidebar.classList.remove('hidden');
                    centerViewerPanel.classList.add('hidden');
                    updatePanelLayout();
                }
                return;
            }

            centerViewerPanel.classList.toggle('hidden');
            updatePanelLayout();
        });
    }

    if (toggleAiBtn && rightSidebar) {
        toggleAiBtn.addEventListener('click', () => {
            const isAiVisible = !rightSidebar.classList.contains('hidden');
            const isViewerVisible = centerViewerPanel && !centerViewerPanel.classList.contains('hidden');
            const isLeftVisible = leftSidebar && !leftSidebar.classList.contains('hidden');

            if (isAiVisible && !isViewerVisible && !isLeftVisible) {
                return;
            }
            rightSidebar.classList.toggle('hidden');
            updatePanelLayout();
        });
    }

    if (closeAiPanelBtn && rightSidebar) {
        closeAiPanelBtn.addEventListener('click', () => {
            const isViewerVisible = centerViewerPanel && !centerViewerPanel.classList.contains('hidden');
            const isLeftVisible = leftSidebar && !leftSidebar.classList.contains('hidden');
            if (!isViewerVisible && !isLeftVisible && centerViewerPanel) {
                centerViewerPanel.classList.remove('hidden');
            }
            rightSidebar.classList.add('hidden');
            updatePanelLayout();
        });
    }

    updatePanelLayout();

    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.getAttribute('data-target');
            const target = document.getElementById(targetId);
            const chevron = header.querySelector('.category-chevron');
            if (!target) return;

            if (target.classList.contains('hidden')) {
                target.classList.remove('hidden');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            } else {
                target.classList.add('hidden');
                if (chevron) chevron.style.transform = 'rotate(-90deg)';
            }
        });
    });

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function addWelcomeMessage() {
        if (!chatHistory) return;
        const div = document.createElement('div');
        div.className = 'bg-[#141B2D] border border-[#262D40] text-slate-200 p-3.5 rounded-xl flex items-start gap-2.5 shadow-sm';
        div.id = 'welcomeMessage';
        const name = courseName || 'your course';
        div.innerHTML = `
            <span class="text-base shrink-0 pt-0.5">👋</span>
            <div class="text-[11px] leading-relaxed text-slate-200">
                <span class="font-bold text-white">Welcome!</span> Ask me anything about <strong>${escapeHtml(name)}</strong> or your uploaded study materials. I can reference specific timestamps and lecture content to guide your study.
            </div>
        `;
        chatHistory.appendChild(div);
    }

    function renderUserBubble(text, timestamp) {
        if (!chatHistory) return;
        const welcome = document.getElementById('welcomeMessage');
        if (welcome) welcome.remove();

        const div = document.createElement('div');
        div.className = 'flex flex-col items-end space-y-1';
        let timeStr = '';
        if (timestamp) {
            const d = new Date(timestamp);
            timeStr = isNaN(d.getTime()) ? timestamp : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        div.innerHTML = `
            <div class="bg-gradient-to-br from-brand-600 to-indigo-600 text-white font-medium p-3 rounded-2xl rounded-tr-none shadow-md max-w-[85%] leading-relaxed">
                ${escapeHtml(text)}
            </div>
            <span class="text-[10px] text-slate-400 font-mono pr-1">${timeStr}</span>
        `;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function renderAIBubble(answer, sources, timestamp) {
        if (!chatHistory) return;
        const welcome = document.getElementById('welcomeMessage');
        if (welcome) welcome.remove();

        const div = document.createElement('div');
        div.className = 'flex flex-col space-y-2';

        let timeStr = '';
        if (timestamp) {
            const d = new Date(timestamp);
            timeStr = isNaN(d.getTime()) ? timestamp : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        let html = `
            <div class="bg-[#141B2D] border border-[#262D40] text-slate-200 p-3 rounded-2xl rounded-tl-none space-y-2 leading-relaxed text-[11px]">
                <p>${escapeHtml(answer).replace(/\n/g, '<br/>')}</p>
            </div>
        `;

        if (sources && sources.length > 0) {
            html += `
            <div class="mt-1">
                <div class="flex items-center justify-between text-[11px] font-bold text-slate-200 mb-1.5">
                    <span class="flex items-center gap-1.5 text-white font-semibold">
                        <svg class="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </svg>
                        <span class="text-slate-100 font-semibold">Grounded Sources (${sources.length})</span>
                    </span>
                </div>
                <div class="space-y-1.5">
            `;

            sources.forEach(src => {
                const startTime = formatTime(src.start || 0);
                const endTime = formatTime(src.end || 0);
                const title = src.title || 'Source Reference';
                const number = src.number ? `Lecture ${src.number} - ` : '';
                const sourceId = src.source_id || '';
                const startSec = src.start || 0;
                const endSec = src.end || 0;

                html += `
                    <div class="group flex items-center justify-between p-2.5 rounded-lg bg-brand-950/70 hover:bg-brand-900/50 border border-brand-500/50 hover:border-brand-400 cursor-pointer transition-all shadow-sm source-card"
                        data-source-id="${escapeHtml(sourceId)}"
                        data-start="${startSec}"
                        data-end="${endSec}"
                        data-number="${escapeHtml(src.number || '')}"
                        data-title="${escapeHtml(src.title || '')}">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-6 h-6 rounded bg-brand-500/30 text-brand-300 flex items-center justify-center shrink-0">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </div>
                            <div class="min-w-0">
                                <div class="text-[11px] font-semibold text-white truncate group-hover:text-brand-200 transition-colors">${escapeHtml(number)}${escapeHtml(title)}</div>
                                <div class="text-[10px] text-slate-300 font-mono font-medium">${startTime} - ${endTime}</div>
                            </div>
                        </div>
                        <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-300 transition-colors shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                    </div>
                `;
            });

            html += '</div></div>';
        }

        if (timeStr) {
            html += `<span class="text-[10px] text-slate-400 font-mono pl-1">${timeStr}</span>`;
        }

        div.innerHTML = html;

        div.querySelectorAll('.source-card').forEach(card => {
            card.addEventListener('click', () => {
                const sourceId = card.dataset.sourceId;
                const startSec = parseFloat(card.dataset.start);
                const number = card.dataset.number;
                const title = card.dataset.title;
                navigateToSource(sourceId, startSec, number, title);
            });
        });

        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function renderError(errStr) {
        if (!chatHistory) return;
        const div = document.createElement('div');
        div.className = 'bg-red-950 border border-red-900 text-red-200 p-3 rounded-2xl rounded-tl-none text-[11px]';
        div.textContent = errStr;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function renderThinking() {
        if (!chatHistory) return;
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 text-slate-400 text-[11px]';
        div.id = 'thinkingIndicator';
        div.innerHTML = `
            <svg class="w-3.5 h-3.5 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Thinking...</span>
        `;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return div;
    }

    function loadConversation(chat) {
        if (!chatHistory) return;
        currentChatId = chat.chat_id;
        localStorage.setItem('lecturelens_active_chat_' + COURSE_ID, currentChatId);
        chatHistory.innerHTML = '';

        const messages = chat.messages || [];
        if (messages.length === 0) {
            addWelcomeMessage();
        } else {
            messages.forEach(msg => {
                if (msg.role === 'user') {
                    renderUserBubble(msg.text, msg.timestamp);
                } else if (msg.role === 'assistant') {
                    renderAIBubble(msg.text, msg.sources, msg.timestamp);
                }
            });
        }
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function fallbackToRecentChat() {
        fetch('/chats?course_id=' + COURSE_ID)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.chats && data.chats.length > 0) {
                    data.chats.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
                    const latest = data.chats[0];
                    loadConversation(latest);
                } else {
                    currentChatId = null;
                    if (chatHistory) chatHistory.innerHTML = '';
                    addWelcomeMessage();
                }
            })
            .catch(() => {
                currentChatId = null;
                if (chatHistory) chatHistory.innerHTML = '';
                addWelcomeMessage();
            });
    }

    function initChatPersistence() {
        const savedChatId = localStorage.getItem('lecturelens_active_chat_' + COURSE_ID);
        if (savedChatId) {
            fetch('/chats/' + savedChatId)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.chat && data.chat.course_id === COURSE_ID) {
                        loadConversation(data.chat);
                    } else {
                        fallbackToRecentChat();
                    }
                })
                .catch(() => fallbackToRecentChat());
        } else {
            fallbackToRecentChat();
        }
    }

    function handleAsk() {
        if (!chatInput) return;
        const question = chatInput.value.trim();
        if (!question) return;

        renderUserBubble(question);
        chatInput.value = '';

        const thinking = renderThinking();

        const payload = {
            question: question,
            course_id: COURSE_ID
        };
        if (currentChatId) {
            payload.chat_id = currentChatId;
        }

        fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (thinking && thinking.parentNode) thinking.remove();
                if (data.success) {
                    currentChatId = data.chat_id;
                    localStorage.setItem('lecturelens_active_chat_' + COURSE_ID, currentChatId);
                    renderAIBubble(data.answer, data.sources);
                    if (pastConversationsPanel && !pastConversationsPanel.classList.contains('hidden')) {
                        loadPastConversations();
                    }
                } else {
                    renderError(data.error || 'An error occurred');
                }
            })
            .catch(() => {
                if (thinking && thinking.parentNode) thinking.remove();
                renderError('Failed to connect to the server.');
            });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', handleAsk);
    }
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAsk();
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            fetch('/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_id: COURSE_ID,
                    title: 'New Conversation'
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.chat_id) {
                        currentChatId = data.chat_id;
                        localStorage.setItem('lecturelens_active_chat_' + COURSE_ID, currentChatId);
                        if (chatHistory) chatHistory.innerHTML = '';
                        addWelcomeMessage();
                        if (pastConversationsPanel && !pastConversationsPanel.classList.contains('hidden')) {
                            loadPastConversations();
                        }
                    }
                })
                .catch(() => {
                    currentChatId = null;
                    localStorage.removeItem('lecturelens_active_chat_' + COURSE_ID);
                    if (chatHistory) chatHistory.innerHTML = '';
                    addWelcomeMessage();
                });
        });
    }

    function formatDateLabel(isoStr) {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return '';
        const now = new Date();
        const diffMs = now - d;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    function loadPastConversations() {
        if (!pastConversationsList) return;
        pastConversationsList.innerHTML = '<div class="p-3 text-center text-slate-400 text-xs">Loading conversations...</div>';

        fetch('/chats?course_id=' + COURSE_ID)
            .then(res => res.json())
            .then(data => {
                if (!data.success || !data.chats || data.chats.length === 0) {
                    pastConversationsList.innerHTML = '<div class="p-3 text-center text-slate-400 text-xs italic">No past conversations yet.</div>';
                    if (pastConversationsCount) pastConversationsCount.textContent = '0';
                    return;
                }

                const chats = data.chats;
                chats.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
                if (pastConversationsCount) pastConversationsCount.textContent = `${chats.length}`;

                pastConversationsList.innerHTML = '';
                chats.forEach(chat => {
                    const isActive = chat.chat_id === currentChatId;
                    const msgCount = (chat.messages || []).length;
                    const dateStr = formatDateLabel(chat.updated_at || chat.created_at);
                    const title = chat.title || (chat.messages && chat.messages[0] ? chat.messages[0].text : 'Conversation');

                    const item = document.createElement('div');
                    item.className = `group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                        isActive
                            ? 'bg-brand-950/60 border-brand-500/60 text-white shadow-sm'
                            : 'bg-[#141B2D]/60 hover:bg-[#1A233A] border-[#262D40] text-slate-300 hover:text-white'
                    }`;

                    item.innerHTML = `
                        <div class="flex items-center gap-2 min-w-0 flex-1 pr-2">
                            <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-brand-400' : 'bg-slate-500 group-hover:bg-slate-400'} shrink-0"></span>
                            <div class="min-w-0 flex-1">
                                <div class="text-xs font-semibold truncate ${isActive ? 'text-brand-200' : 'text-slate-200'}">${escapeHtml(title)}</div>
                                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    <span>${dateStr}</span>
                                    <span>•</span>
                                    <span>${msgCount} ${msgCount === 1 ? 'msg' : 'msgs'}</span>
                                </div>
                            </div>
                        </div>
                        <button class="delete-chat-btn p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition-colors opacity-0 group-hover:opacity-100 shrink-0" title="Delete conversation">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    `;

                    item.addEventListener('click', (e) => {
                        if (e.target.closest('.delete-chat-btn')) return;
                        loadConversation(chat);
                        if (pastConversationsPanel) pastConversationsPanel.classList.add('hidden');
                    });

                    const delBtn = item.querySelector('.delete-chat-btn');
                    if (delBtn) {
                        delBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            fetch('/chats/' + chat.chat_id, { method: 'DELETE' })
                                .then(res => res.json())
                                .then(() => {
                                    if (currentChatId === chat.chat_id) {
                                        currentChatId = null;
                                        localStorage.removeItem('lecturelens_active_chat_' + COURSE_ID);
                                        if (chatHistory) chatHistory.innerHTML = '';
                                        addWelcomeMessage();
                                    }
                                    loadPastConversations();
                                });
                        });
                    }

                    pastConversationsList.appendChild(item);
                });
            })
            .catch(() => {
                pastConversationsList.innerHTML = '<div class="p-3 text-center text-slate-400 text-xs">Failed to load history.</div>';
            });
    }

    if (historyChatBtn && pastConversationsPanel) {
        historyChatBtn.addEventListener('click', () => {
            const isHidden = pastConversationsPanel.classList.contains('hidden');
            if (isHidden) {
                pastConversationsPanel.classList.remove('hidden');
                loadPastConversations();
            } else {
                pastConversationsPanel.classList.add('hidden');
            }
        });
    }

    if (addMaterialBtn && videoFileInput) {
        addMaterialBtn.addEventListener('click', () => {
            videoFileInput.click();
        });

        videoFileInput.addEventListener('change', () => {
            const file = videoFileInput.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('video', file);
            formData.append('course_id', COURSE_ID);

            resetWizard();
            activeUploadSourceId = null;

            if (uploadPanelFilename) uploadPanelFilename.textContent = file.name;
            const compactUploadFilename = document.getElementById('compactUploadFilename');
            if (compactUploadFilename) compactUploadFilename.textContent = file.name;

            if (uploadPanelThumb && uploadPanelThumbPlaceholder) {
                if (uploadObjectUrl) URL.revokeObjectURL(uploadObjectUrl);
                uploadObjectUrl = URL.createObjectURL(file);

                const videoPreview = document.createElement('video');
                videoPreview.src = uploadObjectUrl;
                videoPreview.addEventListener('loadeddata', () => {
                    videoPreview.currentTime = Math.min(1, videoPreview.duration || 0);
                });
                videoPreview.addEventListener('seeked', () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = videoPreview.videoWidth;
                    canvas.height = videoPreview.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
                    uploadPanelThumb.src = canvas.toDataURL('image/jpeg');
                    uploadPanelThumb.classList.remove('hidden');
                    uploadPanelThumbPlaceholder.classList.add('hidden');
                });
                videoPreview.addEventListener('error', () => {
                    uploadPanelThumb.classList.add('hidden');
                    uploadPanelThumbPlaceholder.classList.remove('hidden');
                });
            }

            updateProgressUI('Starting upload...', 'uploading');

            if (!isUploadMinimized && floatingUploadPanel) floatingUploadPanel.classList.remove('hidden');
            if (isUploadMinimized && compactUploadIndicator) compactUploadIndicator.classList.remove('hidden');

            if (uploadStatusEl) uploadStatusEl.classList.remove('hidden');
            if (uploadStatusText) uploadStatusText.textContent = 'Uploading ' + file.name + '...';

            activeUploadXhr = new XMLHttpRequest();
            activeUploadXhr.open('POST', '/upload', true);

            activeUploadXhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    updateProgressUI('Uploading video...', 'uploading');
                }
            };

            activeUploadXhr.onload = function () {
                if (this.status === 0) return;
                activeUploadXhr = null;

                try {
                    const data = JSON.parse(this.responseText);
                    if (data.success) {
                        activeUploadSourceId = data.source_id;
                        if (uploadStatusText) uploadStatusText.textContent = 'Processing lecture: ' + (data.lecture_title || file.name) + '...';
                        fetchLectures();
                        startUploadPolling();
                    } else {
                        throw new Error(data.error || 'Unknown error');
                    }
                } catch (err) {
                    updateProgressUI('Upload failed: ' + err.message, 'uploading');
                    if (uploadStatusText) uploadStatusText.textContent = 'Upload failed: ' + err.message;
                    setTimeout(finishUploadUI, 5000);
                }
            };

            activeUploadXhr.onerror = () => {
                activeUploadXhr = null;
                updateProgressUI('Upload failed: network error', 'uploading');
                if (uploadStatusText) uploadStatusText.textContent = 'Upload failed: connection error';
                setTimeout(finishUploadUI, 5000);
            };

            activeUploadXhr.onabort = () => {
                updateProgressUI('Upload cancelled.', 'cancelled');
                if (uploadStatusText) uploadStatusText.textContent = 'Upload cancelled.';
                setTimeout(finishUploadUI, 3000);
            };

            activeUploadXhr.send(formData);

            videoFileInput.value = '';
        });
    }

    function startUploadPolling() {
        if (uploadPollTimer) clearInterval(uploadPollTimer);
        let lastReportedStatus = null;
        uploadPollTimer = setInterval(() => {
            fetch('/upload/status')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        if (data.status !== lastReportedStatus) {
                            lastReportedStatus = data.status;
                            fetchLectures();
                        }
                        if (data.status === 'idle') {
                            clearInterval(uploadPollTimer);
                            uploadPollTimer = null;
                            finishUploadUI();
                            fetchLectures();
                        } else if (data.status === 'ready') {
                            updateProgressUI('Lecture ready!', 'ready');
                            clearInterval(uploadPollTimer);
                            uploadPollTimer = null;
                            fetchLectures();
                            setTimeout(finishUploadUI, 3000);
                        } else if (data.status === 'failed') {
                            clearInterval(uploadPollTimer);
                            uploadPollTimer = null;
                            if (uploadStatusText) uploadStatusText.textContent = 'Processing failed: ' + (data.error || 'Unknown error');
                            updateProgressUI('Processing failed.', 'failed');
                            setTimeout(finishUploadUI, 5000);
                            fetchLectures();
                        } else if (data.status === 'uploading') {
                            updateProgressUI('Saving to disk...', 'uploading');
                        } else if (data.status === 'processing') {
                            updateProgressUI('Transcribing audio...', 'processing');
                            if (uploadStatusText) uploadStatusText.textContent = 'Processing: ' + data.status + '...';
                        } else if (data.status === 'indexing') {
                            updateProgressUI('Building search index...', 'indexing');
                            if (uploadStatusText) uploadStatusText.textContent = 'Processing: ' + data.status + '...';
                        }
                    }
                })
                .catch(() => { });
        }, 2000);
    }
});
