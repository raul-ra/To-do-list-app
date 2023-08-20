document.getElementById('formTask').addEventListener('submit', saveTask);

function saveTask(e) {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;

    let task = {
        title,
        description,
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

        // Aplicar estilo tachado a la tarea completada
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

function getTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    let tasksView = document.getElementById('tasks');
    tasksView.innerHTML = '';
    for (let i = 0; i < tasks.length; i++) {
        let title = tasks[i].title;
        let description = tasks[i].description;
        let completed = tasks[i].completed;

        let taskCard = document.createElement('div');
        taskCard.className = 'card mb-3';
        taskCard.id = `task-${i}`;  // Establece un ID para cada tarea
        if (completed) {
            taskCard.classList.add('completed-task'); // Agrega una clase para tareas completadas
        }
        taskCard.innerHTML = `
            <div class="card-body">
                <p>
                    <input type="checkbox" ${completed ? 'checked' : ''} onchange="toggleCompleted(${i})" ${completed ? 'disabled' : ''}>
                    ${title} - ${description}
                    <button onclick="editTask(${i})" class="btn btn-primary ml-2" ${completed ? 'disabled' : ''}>Editar</button>
                    <button onclick="deleteTask(${i})" class="btn btn-danger ml-2">Eliminar</button>
                </p>
            </div>
        `;

        tasksView.appendChild(taskCard);
        
        if (completed) {
            taskCard.querySelector('.btn-primary').style.display = 'none';
        }
    }
}

getTasks();


