// Task management system
        class TaskManager {
            constructor() {
                this.tasks = this.loadTasks();
                this.sidebarVisible = true;
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.updateTasksDisplay();
                this.setMinDate();
                this.setupSidebarToggle();
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
                        
                        // Hide sidebar on mobile after navigation
                        if (window.innerWidth <= 768) {
                            this.hideSidebar();
                        }
                    });
                });

                // Search functionality
                document.getElementById('search-text').addEventListener('input', () => this.performSearch());
                document.getElementById('filter-status').addEventListener('change', () => this.performSearch());
            }

            setupSidebarToggle() {
                const toggleBtn = document.getElementById('sidebarToggle');
                const sidebar = document.getElementById('sidebar');
                const mainContent = document.getElementById('mainContent');
                const overlay = document.getElementById('overlay');

                toggleBtn.addEventListener('click', () => {
                    this.toggleSidebar();
                });

                // Close sidebar when clicking overlay (mobile)
                overlay.addEventListener('click', () => {
                    this.hideSidebar();
                });

                // Handle window resize
                window.addEventListener('resize', () => {
                    if (window.innerWidth > 768) {
                        overlay.classList.remove('show');
                        sidebar.classList.remove('show-mobile');
                    }
                });
            }

            toggleSidebar() {
                const sidebar = document.getElementById('sidebar');
                const mainContent = document.getElementById('mainContent');
                const overlay = document.getElementById('overlay');

                if (window.innerWidth <= 768) {
                    // Mobile behavior
                    sidebar.classList.toggle('show-mobile');
                    overlay.classList.toggle('show');
                } else {
                    // Desktop behavior
                    this.sidebarVisible = !this.sidebarVisible;
                    sidebar.classList.toggle('hidden');
                    mainContent.classList.toggle('expanded');
                }
            }

            hideSidebar() {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('overlay');
                
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('show-mobile');
                    overlay.classList.remove('show');
                }
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

                this.displayFilteredTasks(filteredTasks);
            }

            displayFilteredTasks(filteredTasks) {
                const tasksList = document.getElementById('tasks-list');
                const taskCount = document.getElementById('task-count');

                if (filteredTasks.length === 0) {
                    tasksList.innerHTML = `
                        <div style="padding: 2rem; text-align: center; color: var(--secondary-color);">
                            No se encontraron tareas que coincidan con los criterios de búsqueda.
                        </div>
                    `;
                    taskCount.textContent = '0 tareas encontradas';
                    return;
                }

                taskCount.textContent = `${filteredTasks.length} tarea${filteredTasks.length !== 1 ? 's' : ''} encontrada${filteredTasks.length !== 1 ? 's' : ''}`;

                tasksList.innerHTML = filteredTasks.map(task => `
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

            showSection(sectionName) {
                // Hide all sections
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.remove('active');
                });

                // Show the selected section
                const targetSection = document.getElementById(sectionName);
                if (targetSection) {
                    targetSection.classList.add('active');
                }

                // Update display based on section
                if (sectionName === 'tasks') {
                    this.updateTasksDisplay();
                } else if (sectionName === 'search') {
                    this.performSearch();
                }
            }

            updateActiveNav(activeNavItem) {
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });

                // Add active class to clicked nav item
                if (activeNavItem) {
                    activeNavItem.classList.add('active');
                }
            }

            resetForm() {
                document.getElementById('taskForm').reset();
                this.setMinDate(); // Reset min date after form reset
            }

            showNotification(message, type = 'success') {
                // Create notification element
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.textContent = message;
                
                // Style the notification
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    ${type === 'success' ? 'background: #10b981;' : ''}
                    ${type === 'warning' ? 'background: #f59e0b;' : ''}
                    ${type === 'error' ? 'background: #ef4444;' : ''}
                `;

                document.body.appendChild(notification);

                // Animate in
                setTimeout(() => {
                    notification.style.transform = 'translateX(0)';
                }, 100);

                // Remove after 3 seconds
                setTimeout(() => {
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 3000);
            }

            loadTasks() {
                try {
                    const stored = JSON.parse(localStorage.getItem('tasks') || '[]');
                    return Array.isArray(stored) ? stored : [];
                } catch (error) {
                    console.error('Error loading tasks:', error);
                    return [];
                }
            }

            saveTasks() {
                try {
                    localStorage.setItem('tasks', JSON.stringify(this.tasks));
                } catch (error) {
                    console.error('Error saving tasks:', error);
                    this.showNotification('⚠️ Error al guardar las tareas', 'error');
                }
            }

            // Additional utility methods
            getTaskById(taskId) {
                return this.tasks.find(task => task.id === taskId);
            }

            getTasksByStatus(status) {
                return this.tasks.filter(task => task.estado === status);
            }

            getTasksByPriority(priority) {
                return this.tasks.filter(task => task.prioridad === priority);
            }

            getOverdueTasks() {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                return this.tasks.filter(task => {
                    const dueDate = new Date(task.vencimiento);
                    return dueDate < today && task.estado !== 'completada';
                });
            }

            exportTasks() {
                const dataStr = JSON.stringify(this.tasks, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = `tareas_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                
                this.showNotification('📥 Tareas exportadas exitosamente');
            }

            importTasks(event) {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedTasks = JSON.parse(e.target.result);
                        if (Array.isArray(importedTasks)) {
                            // Merge with existing tasks, avoiding duplicates by code
                            const existingCodes = this.tasks.map(task => task.codigo);
                            const newTasks = importedTasks.filter(task => !existingCodes.includes(task.codigo));
                            
                            this.tasks = [...this.tasks, ...newTasks];
                            this.saveTasks();
                            this.updateTasksDisplay();
                            this.showNotification(`📤 ${newTasks.length} tareas importadas exitosamente`);
                        } else {
                            throw new Error('Formato de archivo inválido');
                        }
                    } catch (error) {
                        console.error('Error importing tasks:', error);
                        this.showNotification('⚠️ Error al importar las tareas', 'error');
                    }
                };
                reader.readAsText(file);
            }
        }

        // Initialize the task manager when the DOM is loaded
        let taskManager;
        document.addEventListener('DOMContentLoaded', () => {
            taskManager = new TaskManager();
        });