/* ========================================
   Task Manager Application
   ======================================== */

// ========================================
// Constants
// ========================================
const STORAGE_KEY_TASKS = 'tasks';
const STORAGE_KEY_DARK_MODE = 'darkMode';

const STATUS_PENDING = 'pending';
const STATUS_ACTIVE = 'active';
const STATUS_COMPLETED = 'completed';
const STATUS_CYCLE = [STATUS_PENDING, STATUS_ACTIVE, STATUS_COMPLETED];

const FILTER_ALL = 'all';
const FILTER_PENDING = 'pending';
const FILTER_ACTIVE = 'active';
const FILTER_COMPLETED = 'completed';

const DOM_ID_TASK_FORM = 'taskForm';
const DOM_ID_TASK_INPUT = 'taskInput';
const DOM_ID_FORM_ERROR = 'formError';
const DOM_ID_FILTER_BTNS = '.filter-btn';
const DOM_ID_CLEAR_COMPLETED = 'clearCompleted';
const DOM_ID_DARK_MODE_TOGGLE = 'darkModeToggle';
const DOM_ID_TASK_LIST = 'taskList';
const DOM_ID_TOTAL_COUNT = 'totalCount';
const DOM_ID_COMPLETED_COUNT = 'completedCount';
const DOM_ID_PENDING_COUNT = 'pendingCount';

const MAX_TASK_LENGTH = 255;
const ANNOUNCE_TIMEOUT_MS = 1000;

// ========================================
// Task Manager Class
// ========================================
class TaskManager {
    /**
     * Initialize TaskManager with default values
     */
    constructor() {
        this._tasks = [];
        this._currentFilter = FILTER_ALL;
        this._darkMode = false;
        this._init();
    }

    /**
     * Initialize the application by loading data and setting up listeners
     * @private
     */
    _init() {
        this._loadTasks();
        this._loadDarkModePreference();
        this._setupEventListeners();
        this._render();
    }

    /**
     * Set up all event listeners for form, buttons, and keyboard controls
     * @private
     */
    _setupEventListeners() {
        // Handle form submission for adding new tasks
        const taskForm = document.getElementById(DOM_ID_TASK_FORM);
        taskForm.addEventListener('submit', (event) => this._handleAddTask(event));

        // Handle filter button clicks
        const filterBtns = document.querySelectorAll(DOM_ID_FILTER_BTNS);
        filterBtns.forEach((btn) => {
            btn.addEventListener('click', (event) => this._handleFilter(event));
        });

        // Handle clear completed button
        const clearCompleted = document.getElementById(DOM_ID_CLEAR_COMPLETED);
        clearCompleted.addEventListener('click', () => this._handleClearCompleted());

        // Handle dark mode toggle button
        const darkModeToggle = document.getElementById(DOM_ID_DARK_MODE_TOGGLE);
        darkModeToggle.addEventListener('click', () => this._handleDarkModeToggle());

        // Add keyboard support for filter buttons (Enter and Space)
        filterBtns.forEach((btn) => {
            btn.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    btn.click();
                }
            });
        });
    }

    /**
     * Handle adding a new task from form submission
     * Validates input, creates task object, and saves to storage
     * @param {Event} event - The form submission event
     * @private
     */
    _handleAddTask(event) {
        event.preventDefault();
        const input = document.getElementById(DOM_ID_TASK_INPUT);
        const errorDiv = document.getElementById(DOM_ID_FORM_ERROR);
        const taskText = input.value.trim();

        // Clear any previous error messages
        errorDiv.classList.remove('show');
        errorDiv.textContent = '';

        // Validate task input
        if (!taskText) {
            this._showError('Please enter a task');
            return;
        }

        if (taskText.length > MAX_TASK_LENGTH) {
            this._showError(`Task must be less than ${MAX_TASK_LENGTH} characters`);
            return;
        }

        // Create task object with metadata
        const newTask = {
            id: Date.now(),
            text: taskText,
            status: STATUS_PENDING,
            createdAt: new Date().toISOString()
        };

        // Add task to array and persist
        this._tasks.push(newTask);
        this._saveTasks();
        this._render();

        // Clear input field and refocus for quick successive additions
        input.value = '';
        input.focus();

        // Announce to screen readers for accessibility
        this._announce(`Task "${taskText}" added successfully`);
    }

    /**
     * Handle filter button clicks and update current filter
     * Updates UI state and re-renders task list
     * @param {Event} event - The click event from filter button
     * @private
     */
    _handleFilter(event) {
        const filterValue = event.target.dataset.filter;
        this._currentFilter = filterValue;

        // Update visual state of all filter buttons
        document.querySelectorAll(DOM_ID_FILTER_BTNS).forEach((btn) => {
            const isActive = btn.dataset.filter === filterValue;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });

        // Re-render task list with new filter applied
        this._render();
        this._announce(`Showing ${filterValue} tasks`);
    }

    /**
     * Toggle task status through the status cycle: pending → active → completed → pending
     * Used when clicking the status button on a task
     * @param {number} taskId - The ID of the task to toggle
     * @private
     */
    _handleToggleComplete(taskId) {
        const task = this._tasks.find((t) => t.id === taskId);
        if (task) {
            // Calculate next status in cycle using modulo operator
            const currentIndex = STATUS_CYCLE.indexOf(task.status);
            task.status = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
            
            this._saveTasks();
            this._render();
            this._announce(`Task "${task.text}" status changed to ${task.status}`);
        }
    }

    /**
     * Set task status directly to a specific value
     * @param {number} taskId - The ID of the task to update
     * @param {string} newStatus - The new status value
     * @private
     */
    _handleSetStatus(taskId, newStatus) {
        const task = this._tasks.find((t) => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this._saveTasks();
            this._render();
            this._announce(`Task "${task.text}" marked as ${newStatus}`);
        }
    }

    /**
     * Delete a task by its ID
     * Removes from task list, persists changes, and re-renders
     * @param {number} taskId - The ID of the task to delete
     * @private
     */
    _handleDeleteTask(taskId) {
        const task = this._tasks.find((t) => t.id === taskId);
        if (task) {
            const taskText = task.text;
            this._tasks = this._tasks.filter((t) => t.id !== taskId);
            this._saveTasks();
            this._render();
            this._announce(`Task "${taskText}" deleted`);
        }
    }

    /**
     * Clear all completed tasks from the list
     * @private
     */
    _handleClearCompleted() {
        const completedCount = this._tasks.filter((t) => t.status === STATUS_COMPLETED).length;
        this._tasks = this._tasks.filter((t) => t.status !== STATUS_COMPLETED);
        this._saveTasks();
        this._render();
        this._announce(`${completedCount} completed task(s) cleared`);
    }

    /**
     * Display an error message in the form error container
     * @param {string} message - The error message to display
     * @private
     */
    _showError(message) {
        const errorDiv = document.getElementById(DOM_ID_FORM_ERROR);
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }

    /**
     * Announce a message to screen readers using ARIA live regions
     * Message is automatically removed after timeout
     * @param {string} message - The message to announce
     * @private
     */
    _announce(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        // Clean up announcement after timeout to prevent DOM bloat
        setTimeout(() => announcement.remove(), ANNOUNCE_TIMEOUT_MS);
    }

    /**
     * Get tasks filtered by current filter selection
     * Returns all, pending, active, or completed tasks based on _currentFilter
     * @returns {Array} Filtered array of task objects
     * @private
     */
    _getFilteredTasks() {
        switch (this._currentFilter) {
            case FILTER_PENDING:
                return this._tasks.filter((t) => t.status === STATUS_PENDING);
            case FILTER_ACTIVE:
                return this._tasks.filter((t) => t.status === STATUS_ACTIVE);
            case FILTER_COMPLETED:
                return this._tasks.filter((t) => t.status === STATUS_COMPLETED);
            case FILTER_ALL:
            default:
                return this._tasks;
        }
    }

    /**
     * Update task statistics display (total, completed, pending counts)
     * Also updates the state of the clear completed button
     * @private
     */
    _updateStats() {
        const total = this._tasks.length;
        const completed = this._tasks.filter((t) => t.status === STATUS_COMPLETED).length;
        const pending = this._tasks.filter((t) => t.status === STATUS_PENDING).length;

        // Update DOM elements with calculated statistics
        document.getElementById(DOM_ID_TOTAL_COUNT).textContent = total;
        document.getElementById(DOM_ID_COMPLETED_COUNT).textContent = completed;
        document.getElementById(DOM_ID_PENDING_COUNT).textContent = pending;

        // Disable clear completed button if no completed tasks exist
        const clearCompleted = document.getElementById(DOM_ID_CLEAR_COMPLETED);
        clearCompleted.disabled = completed === 0;
    }

    /**
     * Render the complete task list UI
     * Handles empty states, filtered views, and dynamically creates task elements
     * @private
     */
    _render() {
        const taskList = document.getElementById(DOM_ID_TASK_LIST);
        const filteredTasks = this._getFilteredTasks();

        // Update statistics display
        this._updateStats();

        // Clear current task list
        taskList.innerHTML = '';

        // Show empty state if no tasks exist at all
        if (this._tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state" role="listitem"><p>No tasks yet. Add one to get started!</p></li>';
            return;
        }

        // Show empty state for filtered view
        if (filteredTasks.length === 0) {
            const filterLabelMap = {
                [FILTER_PENDING]: FILTER_PENDING,
                [FILTER_ACTIVE]: FILTER_ACTIVE,
                [FILTER_COMPLETED]: FILTER_COMPLETED
            };
            const filterLabel = filterLabelMap[this._currentFilter] || 'matching';
            taskList.innerHTML = `<li class="empty-state" role="listitem"><p>No ${filterLabel} tasks.</p></li>`;
            return;
        }

        // Render each filtered task as a list item
        filteredTasks.forEach((task) => {
            const taskElement = this._createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    /**
     * Create a task list item DOM element with status button, text, and delete button
     * @param {Object} task - The task object containing id, text, and status
     * @returns {HTMLLIElement} The constructed task list item element
     * @private
     */
    _createTaskElement(task) {
        // Create main task item container
        const listItem = document.createElement('li');
        listItem.className = `task-item${task.status === STATUS_COMPLETED ? ' completed' : ''}${task.status === STATUS_ACTIVE ? ' active' : ''}`;
        listItem.setAttribute('role', 'listitem');

        // Create status button with symbol based on current status
        const statusButton = this._createStatusButton(task);

        // Create task text display
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        // Create actions container with delete button
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        actionsDiv.appendChild(this._createDeleteButton(task));

        // Assemble task element
        listItem.appendChild(statusButton);
        listItem.appendChild(textSpan);
        listItem.appendChild(actionsDiv);

        return listItem;
    }

    /**
     * Create status button element with symbol and click handler
     * Symbol changes based on task status: ○ (pending), ◐ (active), ✓ (completed)
     * @param {Object} task - The task object
     * @returns {HTMLButtonElement} The status button element
     * @private
     */
    _createStatusButton(task) {
        const statusButton = document.createElement('button');
        statusButton.type = 'button';
        statusButton.className = 'status-button';
        statusButton.setAttribute('aria-label', `Change status for "${task.text}" (Current: ${task.status})`);
        statusButton.title = 'Click to cycle through status';

        // Map task status to display symbol and data attribute
        const statusSymbolMap = {
            [STATUS_PENDING]: '○',
            [STATUS_ACTIVE]: '◐',
            [STATUS_COMPLETED]: '✓'
        };

        statusButton.textContent = statusSymbolMap[task.status];
        statusButton.setAttribute('data-status', task.status);

        // Add click handler to cycle through statuses
        statusButton.addEventListener('click', () => this._handleToggleComplete(task.id));

        return statusButton;
    }

    /**
     * Create delete button element with click handler
     * @param {Object} task - The task object
     * @returns {HTMLButtonElement} The delete button element
     * @private
     */
    _createDeleteButton(task) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-delete';
        deleteBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', () => this._handleDeleteTask(task.id));

        return deleteBtn;
    }

    /**
     * Save all tasks to browser localStorage
     * Includes error handling for storage quota exceeded
     * @private
     */
    _saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(this._tasks));
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this._announce('Warning: Could not save tasks to local storage');
        }
    }

    /**
     * Load tasks from browser localStorage
     * Returns empty array if no stored tasks or on load error
     * @private
     */
    _loadTasks() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_TASKS);
            this._tasks = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this._tasks = [];
        }
    }

    /**
     * Toggle dark mode on and off
     * Updates button icon, applies theme, and persists preference
     * @private
     */
    _handleDarkModeToggle() {
        this._darkMode = !this._darkMode;
        this._applyDarkMode();
        this._saveDarkModePreference();
        
        // Update toggle button icon based on new dark mode state
        const toggle = document.getElementById(DOM_ID_DARK_MODE_TOGGLE);
        toggle.textContent = this._darkMode ? '☀️' : '🌙';
        
        // Announce mode change to screen readers
        const mode = this._darkMode ? 'dark' : 'light';
        this._announce(`Dark mode ${mode}`);
    }

    /**
     * Apply dark mode class to body element to trigger CSS theme changes
     * @private
     */
    _applyDarkMode() {
        if (this._darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    /**
     * Load dark mode preference from localStorage
     * Falls back to system preference if not previously set
     * @private
     */
    _loadDarkModePreference() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_DARK_MODE);
            if (saved !== null) {
                // User has previously set a preference
                this._darkMode = JSON.parse(saved);
            } else {
                // Use system preference (prefers-color-scheme media query)
                this._darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            
            this._applyDarkMode();
            
            // Update toggle button icon to match current state
            const toggle = document.getElementById(DOM_ID_DARK_MODE_TOGGLE);
            if (toggle) {
                toggle.textContent = this._darkMode ? '☀️' : '🌙';
            }
        } catch (error) {
            console.error('Failed to load dark mode preference:', error);
            this._darkMode = false;
        }
    }

    /**
     * Save dark mode preference to localStorage
     * @private
     */
    _saveDarkModePreference() {
        try {
            localStorage.setItem(STORAGE_KEY_DARK_MODE, JSON.stringify(this._darkMode));
        } catch (error) {
            console.error('Failed to save dark mode preference:', error);
        }
    }
}

// ========================================
// Application Initialization
// ========================================

/**
 * Initialize the TaskManager application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

/**
 * Save application state before page unload
 * Ensures tasks and preferences are persisted even on forced page close
 */
window.addEventListener('beforeunload', () => {
    if (window.taskManager) {
        window.taskManager._saveTasks();
        window.taskManager._saveDarkModePreference();
    }
});
