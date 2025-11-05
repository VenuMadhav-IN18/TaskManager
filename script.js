let tasks = loadTasks();
let currentFilter = 'all';

// ---- Load & Save ----
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  return saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  updateStatistics();
}

// ---- Add ----
function addTask(title) {
  const task = {
    id: Date.now(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(task);
  saveTasks();
  renderTasks();
}

// ---- Toggle Complete ----
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

// ---- Delete ----
function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }
}

// ---- Edit ----
function editTask(id, newTitle) {
  const task = tasks.find(t => t.id === id);
  if (task && newTitle.trim()) {
    task.title = newTitle.trim();
    saveTasks();
    renderTasks();
  }
}

// ---- Bulk Actions ----
function deleteCompletedTasks() {
  if (confirm('Delete all completed tasks?')) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
  }
}

function markAllAsCompleted() {
  tasks.forEach(task => task.completed = true);
  saveTasks();
  renderTasks();
}

// ---- Filters ----
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
  renderTasks();
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'completed': return tasks.filter(t => t.completed);
    case 'pending': return tasks.filter(t => !t.completed);
    default: return tasks;
  }
}

// ---- Stats ----
function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  document.getElementById('totalTasks').textContent = total;
  document.getElementById('completedTasks').textContent = completed;
  document.getElementById('pendingTasks').textContent = pending;

  const bulkActions = document.getElementById('bulkActions');
  bulkActions.style.display = total > 0 ? 'flex' : 'none';
}

// ---- Render ----
function renderTasks() {
  const tasksList = document.getElementById('tasksList');
  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    let msg = 'No tasks found.';
    if (currentFilter === 'completed') msg = 'No completed tasks.';
    if (currentFilter === 'pending') msg = 'No pending tasks.';
    if (currentFilter === 'all' && tasks.length === 0) msg = 'No tasks yet. Add your first task above!';
    tasksList.innerHTML = `<div class="text-center text-muted py-4">${msg}</div>`;
    return;
  }

  tasksList.innerHTML = filtered.map(task => `
    <div class="task-item border rounded p-3 mb-2 ${task.completed ? 'completed bg-light' : ''}" data-id="${task.id}">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center flex-grow-1">
          <input 
            type="checkbox" 
            class="form-check-input me-3" 
            ${task.completed ? 'checked' : ''} 
            onchange="toggleTask(${task.id})">
          <div class="flex-grow-1">
            <span class="task-title">${escapeHtml(task.title)}</span>
            <small class="text-muted d-block">Created: ${new Date(task.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" onclick="startEdit(${task.id})">✏️</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteTask(${task.id})">🗑️</button>
        </div>
      </div>

      <div class="edit-form mt-2" id="edit-form-${task.id}" style="display: none;">
        <div class="input-group">
          <input type="text" class="form-control" id="edit-input-${task.id}" value="${escapeHtml(task.title)}">
          <button class="btn btn-success btn-sm" onclick="saveEdit(${task.id})">Save</button>
          <button class="btn btn-secondary btn-sm" onclick="cancelEdit(${task.id})">Cancel</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ---- Edit Actions ----
function startEdit(id) {
  document.querySelectorAll('.edit-form').forEach(form => form.style.display = 'none');
  const editForm = document.getElementById(`edit-form-${id}`);
  const editInput = document.getElementById(`edit-input-${id}`);
  if (editForm && editInput) {
    editForm.style.display = 'block';
    editInput.focus();
    editInput.select();
  }
}

function saveEdit(id) {
  const editInput = document.getElementById(`edit-input-${id}`);
  if (editInput) editTask(id, editInput.value);
}

function cancelEdit(id) {
  const editForm = document.getElementById(`edit-form-${id}`);
  if (editForm) editForm.style.display = 'none';
}

// ---- Utility ----
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// ---- Events ----
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  updateStatistics();

  document.getElementById('taskForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    if (title) {
      addTask(title);
      input.value = '';
      input.focus();
    }
  });

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', e => setFilter(e.target.dataset.filter));
  });

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') {
      document.getElementById('taskForm').dispatchEvent(new Event('submit'));
    }
  });
});
