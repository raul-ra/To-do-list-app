const priorityLabels = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta'
};

document.getElementById('formTask').addEventListener('submit', saveTask);

flatpickr("#dueDate", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});

async function saveTask(e) {
    e.preventDefault();

    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dueDate = document.getElementById('dueDate').value;
    let category = document.getElementById('category').value;
    let priority = document.getElementById('priority').value;
    let creationDate = new Date().toISOString();

    let task = {
        title,
        description,
        creationDate,
        dueDate,
        category,
        priority,
        completed: false
    };

    try {
        const response = await fetch('http://localhost:3001/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });

        if (response.ok) {
            getTasks();
            document.getElementById('formTask').reset();
        } else {
            console.error('Error saving task:', response.statusText);
        }
    } catch (error) {
        console.error('Error saving task:', error);
    }
}

async function getTasks(filter = 'all', sortBy = 'dueDate', sortOrder = 'asc', categoryFilter = 'all') {
    let apiUrl = 'http://localhost:3001/tasks';

    try {
        const response = await fetch(apiUrl);
        const tasks = await response.json();

        tasks.sort((a, b) => {
            if (sortBy === 'creationDate') {
                return sortOrder === 'asc' ? new Date(a.creationDate) - new Date(b.creationDate) : new Date(b.creationDate) - new Date(a.creationDate);
            } else if (sortBy === 'dueDate') {
                return sortOrder === 'asc' ? new Date(a.dueDate) - new Date(b.dueDate) : new Date(b.dueDate) - new Date(a.dueDate);
            } else if (sortBy === 'priority') {
                const priorityOrder = { 'low': 2, 'medium': 1, 'high': 0 };
                return sortOrder === 'asc' ? priorityOrder[a.priority] - priorityOrder[b.priority] : priorityOrder[b.priority] - priorityOrder[a.priority];
            }
        });

        let tasksView = document.getElementById('tasks');
        tasksView.innerHTML = '';

        for (let i = 0; i < tasks.length; i++) {
            let title = tasks[i].title;
            let description = tasks[i].description;
            let dueDate = tasks[i].dueDate;
            let category = tasks[i].category;
            let priority = tasks[i].priority;
            let completed = tasks[i].completed;
            let creationDate = tasks[i].creationDate;

            let formattedDueDate = new Date(dueDate).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            let formattedCreationDate = new Date(creationDate).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            let taskCard = document.createElement('div');
            taskCard.className = 'card mb-3';
            taskCard.id = `task-${i}`;

            if (
                (filter === 'completed' && completed) ||
                (filter === 'pending' && !completed) ||
                filter === 'all'
            ) {
                if (categoryFilter === 'all' || (category && categoryFilter === category.toLowerCase())) {
                    taskCard.innerHTML = `
                    <div class="card-body">
                    <p>
                        <input type="checkbox" ${completed ? 'checked' : ''} onchange="toggleCompleted(${i})">
                        ${title} - ${description} - Categoría: ${category} - Prioridad: ${priorityLabels[priority]} - Fecha creación: ${formattedCreationDate} - Fecha vencimiento: ${formattedDueDate}
                        <button onclick="editTask(${i})" class="btn btn-primary ml-2" ${completed ? 'disabled' : ''}>Editar</button>
                        <button onclick="deleteTask(${i})" class="btn btn-danger ml-2">Eliminar</button>
                    </p>
                </div>
                    `;

                    if (completed) {
                        taskCard.querySelector('.btn-primary').style.display = 'none';
                    }

                    tasksView.appendChild(taskCard);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

async function updateTasksOnServer(tasks) {
    try {
        const response = await fetch('http://localhost:3001/tasks', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tasks),
        });

        if (!response.ok) {
            console.error('Error updating tasks:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating tasks:', error);
    }
}

async function toggleCompleted(index) {
    let tasks = await getTasksFromServer();
    tasks[index].completed = !tasks[index].completed;
    await updateTasksOnServer(tasks);
    await applyFilters();
}

async function deleteTask(index) {
    let tasks = await getTasksFromServer();
    tasks.splice(index, 1);
    await updateTasksOnServer(tasks);
    await applyFilters();
}


async function updateTasksOnServer(tasks) {
    try {
        const response = await fetch('http://localhost:3001/tasks', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tasks),
        });

        if (!response.ok) {
            console.error('Error updating tasks:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating tasks:', error);
    }
}

async function saveEditedTask(index) {
    let tasks = await getTasksFromServer();
    let editedTitle = document.getElementById(`edited-title-${index}`).value;
    let editedDescription = document.getElementById(`edited-description-${index}`).value;

    tasks[index].title = editedTitle;
    tasks[index].description = editedDescription;

    await updateTasksOnServer(tasks);
    await applyFilters();
}


async function cancelEditTask(index) {
    await applyFilters();
}

async function applyFilters() {
    const selectedFilter = document.getElementById('filterSelect').value;
    const selectedSort = document.getElementById('sortSelect').value;
    const selectedOrder = document.getElementById('orderSelect').value;
    const selectedCategory = document.getElementById('categoryFilterSelect').value;

    await getTasks(selectedFilter, selectedSort, selectedOrder, selectedCategory);
}


function createFilterSelect() {
    const filterSelect = document.createElement('select');
    filterSelect.id = 'filterSelect';
    filterSelect.className = 'form-control';
    filterSelect.innerHTML = `
        <option value="all">Todas</option>
        <option value="completed">Completadas</option>
        <option value="pending">Pendientes</option>
    `;
    filterSelect.addEventListener('change', function() {
        const selectedFilter = filterSelect.value;
        applyFilter(selectedFilter);
    });

    return filterSelect;
}

function createSortSelect() {
    const sortSelect = document.createElement('select');
    sortSelect.id = 'sortSelect';
    sortSelect.className = 'form-control';
    sortSelect.innerHTML = `
        <option value="dueDate">Fecha de Vencimiento</option>
        <option value="priority">Prioridad</option>
    `;
    sortSelect.addEventListener('change', function() {
        const selectedSort = sortSelect.value;
        const selectedOrder = document.getElementById('orderSelect').value;
        const selectedFilter = document.getElementById('filterSelect').value;
        getTasks(selectedFilter, selectedSort, selectedOrder);
    });

    return sortSelect;
}

function createOrderSelect() {
    const orderSelect = document.createElement('select');
    orderSelect.id = 'orderSelect';
    orderSelect.className = 'form-control';
    orderSelect.innerHTML = `
        <option value="asc">Ascendente</option>
        <option value="desc">Descendente</option>
    `;
    orderSelect.addEventListener('change', function() {
        const selectedOrder = orderSelect.value;
        const selectedSort = document.getElementById('sortSelect').value;
        const selectedFilter = document.getElementById('filterSelect').value;
        getTasks(selectedFilter, selectedSort, selectedOrder);
    });

    return orderSelect;
}

function createCategoryFilterSelect() {
    const categoryFilterSelect = document.createElement('select');
    categoryFilterSelect.id = 'categoryFilterSelect';
    categoryFilterSelect.className = 'form-control';

    const categories = [
        'Todas',  // Mantén esta opción "Todas" en la lista
        'Trabajo',
        'Personal',
        'Estudios',
        'Salud y Ejercicio',
        'Finanzas',
        'Social',
        'Proyectos',
        'Viajes',
        'Compras',
        'Tecnología',
        'Otros'
    ];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        categoryFilterSelect.appendChild(option);
    });

    categoryFilterSelect.addEventListener('change', function() {
        const selectedFilter = document.getElementById('filterSelect').value;
        const selectedSort = document.getElementById('sortSelect').value;
        const selectedOrder = document.getElementById('orderSelect').value;
        const selectedCategory = categoryFilterSelect.value;
        applyFilter(selectedFilter, selectedSort, selectedOrder, selectedCategory);
    });

    return categoryFilterSelect;
}

async function initializeUI() {
    try {
        await getTasks();
        const filterSelect = createFilterSelect();
        const sortSelect = createSortSelect();
        const orderSelect = createOrderSelect();
        const categoryFilterSelect = createCategoryFilterSelect();

        const filterDiv = document.getElementById('filterDiv');
        filterDiv.appendChild(filterSelect);

        const sortDiv = document.getElementById('sortDiv');
        sortDiv.appendChild(sortSelect);

        const orderDiv = document.getElementById('orderDiv');
        orderDiv.appendChild(orderSelect);

        const categoryFilterDiv = document.getElementById('categoryFilterDiv');
        categoryFilterDiv.appendChild(categoryFilterSelect);

        applyFilters(); // Llamada corregida
    } catch (error) {
        console.error('Error initializing UI:', error);
    }
}

initializeUI();
