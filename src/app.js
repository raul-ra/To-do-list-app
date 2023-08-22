// Agregar un oyente de eventos para guardar una tarea al enviar el formulario
document.getElementById('formTask').addEventListener('submit', saveTask);

// Función para guardar una tarea
function saveTask(e) {
    // Obtener valores del formulario
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;

    // Crear un objeto de tarea
    let task = {
        title,
        description,
        completed: false
    };

    // Guardar la tarea en el almacenamiento local
    // Si no hay tareas previas, crea una nueva lista; de lo contrario, agrega a la lista existente
    if (localStorage.getItem('tasks') === null) {
        let tasks = [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } else {
        let tasks = JSON.parse(localStorage.getItem('tasks'));
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Actualizar la visualización de las tareas
    getTasks();
    // Reiniciar el formulario
    document.getElementById('formTask').reset();
    e.preventDefault();
}

// Función para cambiar el estado completado/no completado de una tarea
function toggleCompleted(index) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    getTasks();
}

// Función para eliminar una tarea
function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    getTasks();
}

// Función para editar una tarea
function editTask(index) {
    // Obtener el contenedor de la tarea por su ID
    let taskContainer = document.getElementById(`task-${index}`);
    let tasks = JSON.parse(localStorage.getItem('tasks'));

    // Crear el formulario de edición
    let editForm = document.createElement('div');
    editForm.innerHTML = `
        <input type="text" id="edited-title-${index}" class="form-control mb-2" value="${tasks[index].title}" ${tasks[index].completed ? 'disabled' : ''}>
        <textarea id="edited-description-${index}" rows="3" class="form-control" ${tasks[index].completed ? 'disabled' : ''}>${tasks[index].description}</textarea>
        <button onclick="saveEditedTask(${index})" class="btn btn-primary mt-2" ${tasks[index].completed ? 'disabled' : ''}>Guardar</button>
        <button onclick="cancelEditTask(${index})" class="btn btn-secondary mt-2" ${tasks[index].completed ? 'disabled' : ''}>Cancelar</button>
    `;

    // Reemplazar el contenido de la tarea con el formulario de edición
    taskContainer.innerHTML = '';
    taskContainer.appendChild(editForm);

    // Deshabilitar elementos si la tarea está completada
    if (tasks[index].completed) {
        taskContainer.querySelector(`input[type="checkbox"]`).disabled = true;
        taskContainer.querySelector('.btn-primary').style.display = 'none';
        taskContainer.querySelector('.btn-secondary').style.display = 'none';

        // Aplicar estilo tachado a la tarea completada
        taskContainer.querySelector('.card-body').style.textDecoration = 'line-through';
    }
}

// Función para guardar una tarea editada
function saveEditedTask(index) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    let editedTitle = document.getElementById(`edited-title-${index}`).value;
    let editedDescription = document.getElementById(`edited-description-${index}`).value;

    tasks[index].title = editedTitle;
    tasks[index].description = editedDescription;

    localStorage.setItem('tasks', JSON.stringify(tasks));
    getTasks();
}

// Función para cancelar la edición de una tarea
function cancelEditTask(index) {
    // Volver a obtener las tareas para restaurar el contenido original
    getTasks();
}

// Función para obtener y mostrar las tareas almacenadas en el almacenamiento local
function getTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    let tasksView = document.getElementById('tasks');
    tasksView.innerHTML = '';

    // Iterar sobre las tareas y crear elementos para mostrarlas
    for (let i = 0; i < tasks.length; i++) {
        let title = tasks[i].title;
        let description = tasks[i].description;
        let completed = tasks[i].completed;

        // Crear una tarjeta para cada tarea
        let taskCard = document.createElement('div');
        taskCard.className = 'card mb-3';
        taskCard.id = `task-${i}`;  // Establecer un ID para cada tarea
        if (completed) {
            taskCard.classList.add('completed-task'); // Agregar una clase para tareas completadas
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

        // Ocultar el botón de edición si la tarea está completada
        if (completed) {
            taskCard.querySelector('.btn-primary').style.display = 'none';
        }
    }
}

// Cargar y mostrar las tareas al cargar la página
getTasks();
