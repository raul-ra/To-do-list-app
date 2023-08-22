const priorityLabels = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta'
};

function random(min, max) {
    return Math.random() * (max - min) + min;
}

document.getElementById('formTask').addEventListener('submit', saveTask);

flatpickr("#dueDate", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});

function saveTask(e) {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dueDate = document.getElementById('dueDate').value;
    let category = document.getElementById('category').value;
    let priority = document.getElementById('priority').value;

    let task = {
        title,
        description,
        dueDate,
        category,
        priority,
        completed: false
    };

    if (localStorage.getItem('tasks') === null) {
        let tasks = [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } else {
        let tasks = JSON.parse(localStorage.getItem('tasks'));
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    getTasks();
    document.getElementById('formTask').reset();
    e.preventDefault();
}

function toggleCompleted(index) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    getTasks();
}

function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    getTasks();
}

function editTask(index) {
    let taskContainer = document.getElementById(`task-${index}`);
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    let editForm = document.createElement('div');
    editForm.innerHTML = `
        <input type="text" id="edited-title-${index}" class="form-control mb-2" value="${tasks[index].title}" ${tasks[index].completed ? 'disabled' : ''}>
        <textarea id="edited-description-${index}" rows="3" class="form-control" ${tasks[index].completed ? 'disabled' : ''}>${tasks[index].description}</textarea>
        <button onclick="saveEditedTask(${index})" class="btn btn-primary mt-2" ${tasks[index].completed ? 'disabled' : ''}>Guardar</button>
        <button onclick="cancelEditTask(${index})" class="btn btn-secondary mt-2" ${tasks[index].completed ? 'disabled' : ''}>Cancelar</button>
    `;

    taskContainer.innerHTML = '';
    taskContainer.appendChild(editForm);

    if (tasks[index].completed) {
        taskContainer.querySelector(`input[type="checkbox"]`).disabled = true;
        taskContainer.querySelector('.btn-primary').style.display = 'none';
        taskContainer.querySelector('.btn-secondary').style.display = 'none';
        taskContainer.querySelector('.card-body').style.textDecoration = 'line-through';
    }
}

function saveEditedTask(index) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    let editedTitle = document.getElementById(`edited-title-${index}`).value;
    let editedDescription = document.getElementById(`edited-description-${index}`).value;

    tasks[index].title = editedTitle;
    tasks[index].description = editedDescription;

    localStorage.setItem('tasks', JSON.stringify(tasks));
    getTasks();
}

function cancelEditTask(index) {
    getTasks();
}

function applyFilter(filter) {
    const sortBy = document.getElementById('sortSelect').value;
    const sortOrder = document.getElementById('orderSelect').value;
    getTasks(filter, sortBy, sortOrder);
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

function getTasks(filter = 'all', sortBy = 'dueDate', sortOrder = 'asc') {
    let tasks = JSON.parse(localStorage.getItem('tasks'));

    tasks.sort((a, b) => {
        if (sortBy === 'dueDate') {
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

        let formattedDueDate = new Date(dueDate);
        let formattedDate = formattedDueDate.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        let taskCard = document.createElement('div');
        taskCard.className = 'card mb-3';
        taskCard.id = `task-${i}`;

        if ((filter === 'completed' && completed) || (filter === 'pending' && !completed) || filter === 'all') {
            taskCard.innerHTML = `
                <div class="card-body">
                    <p>
                        <input type="checkbox" ${completed ? 'checked' : ''} onchange="toggleCompleted(${i})">
                        ${title} - ${description} - Categoría: ${category} - Prioridad: ${priorityLabels[priority]} - Fecha: ${formattedDate}
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

function initializeUI() {
    const filterSelect = createFilterSelect();
    const sortSelect = createSortSelect();
    const orderSelect = createOrderSelect();

    const filterDiv = document.getElementById('filterDiv');
    filterDiv.appendChild(filterSelect);

    const sortDiv = document.getElementById('sortDiv');
    sortDiv.appendChild(sortSelect);

    const orderDiv = document.getElementById('orderDiv');
    orderDiv.appendChild(orderSelect);

    applyFilter('all');
}

initializeUI();

