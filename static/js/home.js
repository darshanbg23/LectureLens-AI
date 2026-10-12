document.addEventListener('DOMContentLoaded', () => {
    const coursesGrid = document.getElementById('courses-grid');
    const emptyState = document.getElementById('empty-state');
    const btnCreateCourse = document.getElementById('btn-create-course');
    const courseCountBadge = document.getElementById('course-count-badge');

    const createCourseModal = document.getElementById('create-course-modal');
    const createCourseForm = document.getElementById('create-course-form');
    const cancelCreateCourseBtn = document.getElementById('cancelCreateCourseBtn');
    const courseNameInput = document.getElementById('courseNameInput');
    const courseInstructorInput = document.getElementById('courseInstructorInput');
    const courseNameError = document.getElementById('courseNameError');

    const deleteCourseModal = document.getElementById('delete-course-modal');
    const cancelDeleteCourseBtn = document.getElementById('cancelDeleteCourseBtn');
    const submitDeleteCourseBtn = document.getElementById('submitDeleteCourseBtn');
    const deleteCourseNameDisplay = document.getElementById('deleteCourseNameDisplay');
    const deleteCourseError = document.getElementById('deleteCourseError');

    let currentCourseIdToDelete = null;

    function fetchCourses() {
        fetch('/courses')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderCourses(data.courses);
                }
            })
            .catch(err => console.error("Failed to load courses", err));
    }

    function renderCourses(courses) {
        coursesGrid.innerHTML = '';
        courseCountBadge.textContent = `${courses.length} Active`;

        if (courses.length === 0) {
            emptyState.classList.remove('hidden');
            coursesGrid.classList.add('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        coursesGrid.classList.remove('hidden');

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = "rounded-2xl bg-[#10141e] border border-[#262d40] hover:border-[#8b5cf6]/60 hover:bg-[#131926] p-5 flex flex-col justify-between transition-all duration-200 group shadow-lg hover:shadow-[0_12px_30px_-8px_rgba(139,92,246,0.22)]";
            card.innerHTML = `
                <div>
                    <div class="flex items-start justify-between">
                        <div class="w-10 h-10 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/35 text-[#d0bcff] flex items-center justify-center">
                            <span class="material-symbols-outlined text-[20px]">school</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-1 rounded-lg bg-[#131926] border border-[#262d40] font-mono text-xs font-semibold text-slate-200">
                                ${course.course_id.substring(0, 6)}
                            </span>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h2 class="text-lg font-bold text-white group-hover:text-[#d0bcff] transition-colors tracking-tight">
                            ${course.name}
                        </h2>
                        <p class="text-xs text-slate-300 font-medium mt-1">
                            ${course.instructor}
                        </p>
                    </div>
                    <div class="mt-5 flex flex-wrap gap-2 text-xs">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161a27] border border-[#262d40] text-slate-200 font-medium">
                            <span class="material-symbols-outlined text-[15px] text-[#a78bfa]">play_circle</span>
                            Videos
                        </span>
                    </div>
                </div>
                <div class="mt-6 pt-4 border-t border-[#262d40] space-y-3">
                    <div class="flex items-center justify-between text-xs text-slate-300">
                        <span class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
                            Recently Updated
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <a class="flex-1 py-2.5 px-3 rounded-xl bg-[#131926] hover:bg-[#8b5cf6] hover:text-white text-slate-100 text-xs font-semibold border border-[#262d40] hover:border-[#8b5cf6] transition-all flex items-center justify-center gap-1.5 group/btn" href="/workspace/${course.course_id}">
                            <span>Open Course</span>
                            <span class="material-symbols-outlined text-[15px] transition-transform group-hover/btn:translate-x-0.5">arrow_forward</span>
                        </a>
                        <button class="delete-course-btn py-2.5 px-2.5 rounded-xl bg-[#131926] hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs font-semibold border border-[#262d40] hover:border-red-800 transition-all flex items-center justify-center" title="Delete Course" data-course-id="${course.course_id}" data-course-name="${course.name}">
                            <span class="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                    </div>
                </div>
            `;
            coursesGrid.appendChild(card);
        });

        document.querySelectorAll('.delete-course-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const courseId = btn.dataset.courseId;
                const courseName = btn.dataset.courseName;
                deleteCourse(courseId, courseName);
            });
        });
    }

    function deleteCourse(courseId, courseName) {
        currentCourseIdToDelete = courseId;
        deleteCourseNameDisplay.textContent = `"${courseName}"`;
        deleteCourseError.classList.add('hidden');
        deleteCourseError.textContent = '';
        deleteCourseModal.classList.remove('hidden');
    }

    cancelDeleteCourseBtn.addEventListener('click', () => {
        deleteCourseModal.classList.add('hidden');
        currentCourseIdToDelete = null;
    });

    submitDeleteCourseBtn.addEventListener('click', () => {
        if (!currentCourseIdToDelete) return;

        const originalText = submitDeleteCourseBtn.textContent;
        submitDeleteCourseBtn.textContent = 'Deleting...';
        submitDeleteCourseBtn.disabled = true;

        fetch('/courses/' + currentCourseIdToDelete, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                deleteCourseModal.classList.add('hidden');
                fetchCourses();
            } else {
                deleteCourseError.textContent = "Failed to delete course: " + (data.error || "Unknown error");
                deleteCourseError.classList.remove('hidden');
            }
        })
        .catch(err => {
            console.error("Failed to delete course", err);
            deleteCourseError.textContent = "Error deleting course. Please try again.";
            deleteCourseError.classList.remove('hidden');
        })
        .finally(() => {
            submitDeleteCourseBtn.textContent = originalText;
            submitDeleteCourseBtn.disabled = false;
        });
    });

    btnCreateCourse.addEventListener('click', () => {
        createCourseForm.reset();
        courseNameError.classList.add('hidden');
        courseNameError.textContent = '';
        createCourseModal.classList.remove('hidden');
        setTimeout(() => courseNameInput.focus(), 100);
    });

    cancelCreateCourseBtn.addEventListener('click', () => {
        createCourseModal.classList.add('hidden');
    });

    createCourseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = courseNameInput.value.trim();
        const instructor = courseInstructorInput.value.trim();
        
        if (!name) {
            courseNameError.textContent = "Course name is required.";
            courseNameError.classList.remove('hidden');
            return;
        }

        courseNameError.classList.add('hidden');
        
        const submitBtn = document.getElementById('submitCreateCourseBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating...';
        submitBtn.disabled = true;

        fetch('/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, instructor })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                createCourseModal.classList.add('hidden');
                fetchCourses();
            } else {
                courseNameError.textContent = "Failed to create course: " + data.error;
                courseNameError.classList.remove('hidden');
            }
        })
        .catch(err => {
            console.error("Failed to create course", err);
            courseNameError.textContent = "Error creating course. Please try again.";
            courseNameError.classList.remove('hidden');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!createCourseModal.classList.contains('hidden')) {
                createCourseModal.classList.add('hidden');
            }
            if (!deleteCourseModal.classList.contains('hidden')) {
                deleteCourseModal.classList.add('hidden');
                currentCourseIdToDelete = null;
            }
        }
    });

    fetchCourses();
});
