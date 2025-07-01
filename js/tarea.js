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
        const imagePreview = document.querySelector('#imagePreview img');
        const imagen = imagePreview ? imagePreview.src : null;

        const formData = {
            id: Date.now(),
            codigo: document.getElementById('codigo').value,
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            prioridad: document.getElementById('prioridad').value,
            estado: document.getElementById('estado').value,
            vencimiento: document.getElementById('vencimiento').value,
            asignado: document.getElementById('asignado').value || 'No asignado',
            fechaCreacion: new Date().toLocaleDateString(),
            imagen: imagen // ✅ Guardar imagen (base64)
        };

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

        ${task.imagen ? `
  <div style="margin-top: 0.5rem; border-radius: 10px; overflow: hidden; border: 1px solid #ddd;">
    <img src="${task.imagen}" 
         style="display: block; width: 100%; height: auto; max-height: 300px; object-fit: contain; background: #f9f9f9;" 
         alt="Imagen de la tarea">
  </div>
` : ''}


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
        try {
            const stored = JSON.parse(localStorage.getItem('tasks') || '[]');
            return Array.isArray(stored) ? stored : [];
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error al guardar las tareas:', error);
        }
    }


    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('expanded');
    }
}

// Código para manejo de imágenes fuera de la clase TaskManager
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const galleryBtn = document.getElementById('galleryBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const imagePreview = document.getElementById('imagePreview');
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const removeBtn = document.getElementById('removeImageBtn');

    // Mostrar selector de archivos
    galleryBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Cargar imagen desde archivo
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (event) {
                showImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // Iniciar cámara
    cameraBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = 'block';

            // Esperar un poco y capturar
            setTimeout(() => {
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/png');
                showImagePreview(imageData);

                // Detener la cámara
                stream.getTracks().forEach(track => track.stop());
                video.style.display = 'none';
            }, 2000); // Captura después de 2 segundos
        } catch (err) {
            alert('No se pudo acceder a la cámara');
            console.error(err);
        }
    });

    // Eliminar imagen
    removeBtn.addEventListener('click', () => {
        imagePreview.innerHTML = `
            <div class="image-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                </svg>
                <p>No hay imagen seleccionada</p>
            </div>
        `;
        removeBtn.style.display = 'none';
    });

    // Mostrar la imagen en el preview
    function showImagePreview(src) {
        imagePreview.innerHTML = `<img src="${src}" style="width: 100%; height: auto; border-radius: 8px;" />`;
        removeBtn.style.display = 'inline-block';
    }
});

// Global functions
function resetForm() {
    taskManager.resetForm();
}

// Initialize the application
const taskManager = new TaskManager();