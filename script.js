/* ========================================
   Task Manager Application
   ======================================== */

class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Form submission
        const taskForm = document.getElementById('taskForm');
        taskForm.addEventListener('submit', (e) => this.handleAddTask(e));

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Clear completed button
        const clearCompleted = document.getElementById('clearCompleted');
        clearCompleted.addEventListener('click', () => this.handleClearCompleted());

        // Keyboard support for filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }

    handleAddTask(e) {
        e.preventDefault();
        const input = document.getElementById('taskInput');
        const errorDiv = document.getElementById('formError');
        const taskText = input.value.trim();

        // Clear previous error
        errorDiv.classList.remove('show');
        errorDiv.textContent = '';

        // Validation
        if (!taskText) {
            this.showError('Please enter a task');
            return;
        }

        if (taskText.length > 255) {
            this.showError('Task must be less than 255 characters');
            return;
        }

        // Create task
        const task = {
            id: Date.now(),
            text: taskText,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();

        // Clear input and refocus
        input.value = '';
        input.focus();

        // Announce to screen readers
        this.announce(`Task "${taskText}" added successfully`);
    }

    handleFilter(e) {
        const filterValue = e.target.dataset.filter;
        this.currentFilter = filterValue;

        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const isActive = btn.dataset.filter === filterValue;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });

        this.render();
        this.announce(`Showing ${filterValue} tasks`);
    }

    handleToggleComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            // Cycle through statuses: pending -> active -> completed -> pending
            const statusCycle = ['pending', 'active', 'completed'];
            const currentIndex = statusCycle.indexOf(task.status);
            task.status = statusCycle[(currentIndex + 1) % statusCycle.length];
            this.saveTasks();
            this.render();
            this.announce(`Task "${task.text}" status changed to ${task.status}`);
        }
    }

    handleSetStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
            this.render();
            this.announce(`Task "${task.text}" marked as ${newStatus}`);
        }
    }

    handleDeleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const taskText = task.text;
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.render();
            this.announce(`Task "${taskText}" deleted`);
        }
    }

    handleClearCompleted() {
        const completedCount = this.tasks.filter(t => t.status === 'completed').length;
        this.tasks = this.tasks.filter(t => t.status !== 'completed');
        this.saveTasks();
        this.render();
        this.announce(`${completedCount} completed task(s) cleared`);
    }

    showError(message) {
        const errorDiv = document.getElementById('formError');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }

    announce(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(t => t.status === 'pending');
            case 'active':
                return this.tasks.filter(t => t.status === 'active');
            case 'completed':
                return this.tasks.filter(t => t.status === 'completed');
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        const pending = this.tasks.filter(t => t.status === 'pending').length;
        const active = this.tasks.filter(t => t.status === 'active').length;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('pendingCount').textContent = pending;

        // Update clear completed button
        const clearCompleted = document.getElementById('clearCompleted');
        clearCompleted.disabled = completed === 0;
    }

    render() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        // Update stats
        this.updateStats();

        // Clear list
        taskList.innerHTML = '';

        // Show empty state if no tasks
        if (this.tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state" role="listitem"><p>No tasks yet. Add one to get started!</p></li>';
            return;
        }

        // Show empty state for filtered view
        if (filteredTasks.length === 0) {
            const filterMap = { pending: 'pending', active: 'active', completed: 'completed' };
            const filterName = filterMap[this.currentFilter] || 'matching';
            taskList.innerHTML = `<li class="empty-state" role="listitem"><p>No ${filterName} tasks.</p></li>`;
            return;
        }

        // Render tasks
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item${task.status === 'completed' ? ' completed' : ''}${task.status === 'active' ? ' active' : ''}`;
            li.setAttribute('role', 'listitem');

            const statusButton = document.createElement('button');
            statusButton.type = 'button';
            statusButton.className = 'status-button';
            statusButton.setAttribute('aria-label', `Change status for "${task.text}" (Current: ${task.status})`);
            statusButton.title = 'Click to cycle through status';
            
            // Set status button appearance based on current status
            if (task.status === 'pending') {
                statusButton.textContent = '○';
                statusButton.setAttribute('data-status', 'pending');
            } else if (task.status === 'active') {
                statusButton.textContent = '◐';
                statusButton.setAttribute('data-status', 'active');
            } else if (task.status === 'completed') {
                statusButton.textContent = '✓';
                statusButton.setAttribute('data-status', 'completed');
            }
            
            statusButton.addEventListener('click', () => this.handleToggleComplete(task.id));

            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.textContent = task.text;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions';

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-delete';
            deleteBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
            deleteBtn.textContent = '✕';
            deleteBtn.addEventListener('click', () => this.handleDeleteTask(task.id));

            actionsDiv.appendChild(deleteBtn);

            li.appendChild(statusButton);
            li.appendChild(textSpan);
            li.appendChild(actionsDiv);

            taskList.appendChild(li);
        });
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this.announce('Warning: Could not save tasks to local storage');
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('tasks');
            this.tasks = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.tasks = [];
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.taskManager) {
        window.taskManager.saveTasks();
    }
});
