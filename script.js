class TaskManager {
      constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
      }

      init() {
        this.renderTasks();
        this.setupEventListeners();
        this.updateStatistics();
      }

      loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
      }

      saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.updateStatistics();
      }

      addTask(title) {
        const task = {
          id: Date.now(),
          title: title.trim(),
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
      }

      toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
          task.completed = !task.completed;
          this.saveTasks();
          this.renderTasks();
        }
      }

      deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
          this.tasks = this.tasks.filter(t => t.id !== id);
          this.saveTasks();
          this.renderTasks();
        }
      }

      editTask(id, newTitle) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newTitle.trim()) {
          task.title = newTitle.trim();
          this.saveTasks();
          this.renderTasks();
        }
      }

      deleteCompletedTasks() {
        if (confirm('Delete all completed tasks?')) {
          this.tasks = this.tasks.filter(t => !t.completed);
          this.saveTasks();
          this.renderTasks();
        }
      }

      markAllAsCompleted() {
        this.tasks.forEach(task => {
          task.completed = true;
        });
        this.saveTasks();
        this.renderTasks();
      }

      setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('[data-filter]').forEach(btn => {
          btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.renderTasks();
      }

      getFilteredTasks() {
        switch (this.currentFilter) {
          case 'completed':
            return this.tasks.filter(t => t.completed);
          case 'pending':
            return this.tasks.filter(t => !t.completed);
          default:
            return this.tasks;
        }
      }

      updateStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;

        // Show/hide bulk actions
        const bulkActions = document.getElementById('bulkActions');
        bulkActions.style.display = total > 0 ? 'flex' : 'none';
      }

      renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
          let message = 'No tasks found.';
          if (this.currentFilter === 'completed') message = 'No completed tasks.';
          if (this.currentFilter === 'pending') message = 'No pending tasks.';
          if (this.currentFilter === 'all' && this.tasks.length === 0) message = 'No tasks yet. Add your first task above!';
          
          tasksList.innerHTML = `<div class="text-center text-muted py-4">${message}</div>`;
          return;
        }

        tasksList.innerHTML = filteredTasks.map(task => `
          <div class="task-item border rounded p-3 mb-2 ${task.completed ? 'completed bg-light' : ''}" data-id="${task.id}">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center flex-grow-1">
                <input 
                  type="checkbox" 
                  class="form-check-input me-3" 
                  ${task.completed ? 'checked' : ''}
                  onchange="taskManager.toggleTask(${task.id})"
                >
                <div class="flex-grow-1">
                  <span class="task-title">${this.escapeHtml(task.title)}</span>
                  <small class="text-muted d-block">Created: ${new Date(task.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
              <div class="btn-group">
                <button class="btn btn-outline-primary btn-sm" onclick="taskManager.startEdit(${task.id})">
                  ✏️
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="taskManager.deleteTask(${task.id})">
                  🗑️
                </button>
              </div>
            </div>
            <div class="edit-form mt-2" id="edit-form-${task.id}" style="display: none;">
              <div class="input-group">
                <input type="text" class="form-control" id="edit-input-${task.id}" value="${this.escapeHtml(task.title)}">
                <button class="btn btn-success btn-sm" onclick="taskManager.saveEdit(${task.id})">Save</button>
                <button class="btn btn-secondary btn-sm" onclick="taskManager.cancelEdit(${task.id})">Cancel</button>
              </div>
            </div>
          </div>
        `).join('');
      }

      startEdit(id) {
        // Hide all other edit forms
        document.querySelectorAll('.edit-form').forEach(form => {
          form.style.display = 'none';
        });
        
        const editForm = document.getElementById(`edit-form-${id}`);
        const editInput = document.getElementById(`edit-input-${id}`);
        
        if (editForm && editInput) {
          editForm.style.display = 'block';
          editInput.focus();
          editInput.select();
        }
      }

      saveEdit(id) {
        const editInput = document.getElementById(`edit-input-${id}`);
        if (editInput) {
          this.editTask(id, editInput.value);
        }
      }

      cancelEdit(id) {
        const editForm = document.getElementById(`edit-form-${id}`);
        if (editForm) {
          editForm.style.display = 'none';
        }
      }

      escapeHtml(unsafe) {
        return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      setupEventListeners() {
        // Add task form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const input = document.getElementById('taskInput');
          const title = input.value.trim();
          
          if (title) {
            this.addTask(title);
            input.value = '';
            input.focus();
          }
        });

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            this.setFilter(e.target.dataset.filter);
          });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.key === 'Enter') {
            document.getElementById('taskForm').dispatchEvent(new Event('submit'));
          }
        });
      }
    }

    // Initialize Task Manager when page loads
    let taskManager;
    document.addEventListener('DOMContentLoaded', () => {
      taskManager = new TaskManager();
    });

    // Global functions for onclick events
    function deleteCompletedTasks() {
      taskManager.deleteCompletedTasks();
    }

    function markAllAsCompleted() {
      taskManager.markAllAsCompleted();
    }