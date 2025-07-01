// Task management system
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.init();
    }

    init() {
        this.setupEventListeners();
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        this.updateTasksDisplay();
        this.setMinDate();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(e.target.closest('.nav-item').dataset.section);
                this.updateActiveNav(e.target.closest('.nav-item'));
            });
        });

        // Search functionality
        document.getElementById('search-text').addEventListener('input', () => this.performSearch());
        document.getElementById('filter-status').addEventListener('change', () => this.performSearch());
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('vencimiento').min = today;
    }

    addTask() {
        const formData = {
            id: Date.now(),
            codigo: document.getElementById('codigo').value,
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            prioridad: document.getElementById('prioridad').value,
            estado: document.getElementById('estado').value,
            vencimiento: document.getElementById('vencimiento').value,
            asignado: document.getElementById('asignado').value || 'No asignado',
            fechaCreacion: new Date().toLocaleDateString()
        };

        // Validate unique code
        if (this.tasks.some(task => task.codigo === formData.codigo)) {
            this.showNotification('⚠️ El código de tarea ya existe', 'warning');
            return;
        }

        this.tasks.push(formData);
        this.saveTasks();
        this.updateTasksDisplay();
        this.resetForm();
        this.showNotification('✅ Tarea creada exitosamente');
    }

    updateTasksDisplay() {
        const tasksList = document.getElementById('tasks-list');
        const taskCount = document.getElementById('task-count');

        if (this.tasks.length === 0) {
            tasksList.innerHTML = `
                        <div style="padding: 2rem; text-align: center; color: var(--secondary-color);">
                            No hay tareas registradas. ¡Crea tu primera tarea!
                        </div>
                    `;
            taskCount.textContent = '0 tareas';
            return;
        }

        taskCount.textContent = `${this.tasks.length} tarea${this.tasks.length !== 1 ? 's' : ''}`;

        tasksList.innerHTML = this.tasks.map(task => `
                    <div class="task-item priority-${task.prioridad}">
                        <div class="task-header">
                            <h3 class="task-title">${task.nombre}</h3>
                            <span class="task-code">${task.codigo}</span>
                        </div>
                        <p class="task-description">${task.descripcion}</p>
                        <div class="task-meta">
                            <span class="task-badge status-${task.estado}">${this.getStatusLabel(task.estado)}</span>
                            <span class="task-badge priority-${task.prioridad === 'alta' ? 'high' : task.prioridad === 'media' ? 'medium' : 'low'}">${this.getPriorityLabel(task.prioridad)}</span>
                            <span>📅 ${new Date(task.vencimiento).toLocaleDateString()}</span>
                            <span>👤 ${task.asignado}</span>
                            <button onclick="taskManager.deleteTask(${task.id})" style="background: var(--danger-color); color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Eliminar</button>
                        </div>
                    </div>
                `).join('');
    }

    getStatusLabel(status) {
        const labels = {
            'pendiente': '⏳ Pendiente',
            'progreso': '🔄 En Progreso',
            'completada': '✅ Completada'
        };
        return labels[status] || status;
    }

    getPriorityLabel(priority) {
        const labels = {
            'alta': '🔴 Alta',
            'media': '🟡 Media',
            'baja': '🟢 Baja'
        };
        return labels[priority] || priority;
    }

    deleteTask(taskId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.updateTasksDisplay();
            this.showNotification('🗑️ Tarea eliminada');
        }
    }

    performSearch() {
        const searchText = document.getElementById('search-text').value.toLowerCase();
        const statusFilter = document.getElementById('filter-status').value;

        let filteredTasks = this.tasks;

        if (searchText) {
            filteredTasks = filteredTasks.filter(task =>
                task.nombre.toLowerCase().includes(searchText) ||
                task.codigo.toLowerCase().includes(searchText) ||
                task.descripcion.toLowerCase().includes(searchText)
            );
        }

        if (statusFilter) {
            filteredTasks = filteredTasks.filter(task => task.estado === statusFilter);
        }

        this.displaySearchResults(filteredTasks);
    }

    displaySearchResults(tasks) {
        const resultsContainer = document.getElementById('search-results');

        if (tasks.length === 0) {
            resultsContainer.innerHTML = `
                        <div style="padding: 2rem; text-align: center; color: var(--secondary-color);">
                            No se encontraron tareas que coincidan con los criterios de búsqueda.
                        </div>
                    `;
            return;
        }

        resultsContainer.innerHTML = `
                    <h3 style="margin-bottom: 1rem;">Resultados (${tasks.length} tarea${tasks.length !== 1 ? 's' : ''})</h3>
                    ${tasks.map(task => `
                        <div class="task-item priority-${task.prioridad}">
                            <div class="task-header">
                                <h3 class="task-title">${task.nombre}</h3>
                                <span class="task-code">${task.codigo}</span>
                            </div>
                            <p class="task-description">${task.descripcion}</p>
                            <div class="task-meta">
                                <span class="task-badge status-${task.estado}">${this.getStatusLabel(task.estado)}</span>
                                <span class="task-badge priority-${task.prioridad === 'alta' ? 'high' : task.prioridad === 'media' ? 'medium' : 'low'}">${this.getPriorityLabel(task.prioridad)}</span>
                                <span>📅 ${new Date(task.vencimiento).toLocaleDateString()}</span>
                                <span>👤 ${task.asignado}</span>
                            </div>
                        </div>
                    `).join('')}
                `;
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('main > section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const sectionMap = {
            'tasks': 'tasks-section',
            'new-task': 'new-task-section',
            'search': 'search-section'
        };

        const targetSection = document.getElementById(sectionMap[sectionName]);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Update tasks display if switching to tasks section
        if (sectionName === 'tasks') {
            this.updateTasksDisplay();
        }
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-item').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    resetForm() {
        document.getElementById('taskForm').reset();
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    loadTasks() {
        // In a real application, this would load from a database
        // For now, we'll use an empty array as browser storage is not supported
        return [];
    }

    saveTasks() {
        // In a real application, this would save to a database
        // For now, tasks are only stored in memory during the session
        console.log('Tasks saved:', this.tasks);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('expanded');
    }

}

// Global functions
function resetForm() {
    taskManager.resetForm();
}

// Initialize the application
const taskManager = new TaskManager();