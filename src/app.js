document.getElementById('formTask').addEventListener('submit', saveTask);
document.getElementById('tasks').addEventListener('click', handleTaskActions);

async function getTasks() {
    try {
        const response = await fetch('http://localhost:3000/tasks');
        const tasks = await response.json();

        let tasksView = document.getElementById('tasks');
        tasksView.innerHTML = '';

        for (let i = 0; i < tasks.length; i++) {
            let title = tasks[i].title;
            let description = tasks[i].description;
            let completed = tasks[i].completed;

            let taskCard = document.createElement('div');
            taskCard.className = 'card mb-3';
            taskCard.id = `task-${i}`;
            if (completed) {
                taskCard.classList.add('completed-task');
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
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

async function saveTask(e) {
    e.preventDefault();

    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;

    let task = {
        title,
        description,
        completed: false
    };

    try {
        await fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        getTasks();
        document.getElementById('formTask').reset();
    } catch (error) {
        console.error('Error saving task:', error);
    }
}

async function toggleCompleted(index) {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${index}`);
        let task = await response.json();

        task.completed = !task.completed;

        await fetch(`http://localhost:3000/tasks/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        getTasks();
    } catch (error) {
        console.error('Error toggling completed status:', error);
    }
}

async function editTask(index) {
    let taskContainer = document.getElementById(`task-${index}`);

    try {
        const response = await fetch(`http://localhost:3000/tasks/${index}`);
        let task = await response.json();

        let editForm = document.createElement('div');
        editForm.innerHTML = `
            <input type="text" id="edited-title-${index}" class="form-control mb-2" value="${task.title}" ${task.completed ? 'disabled' : ''}>
            <textarea id="edited-description-${index}" rows="3" class="form-control" ${task.completed ? 'disabled' : ''}>${task.description}</textarea>
            <button onclick="saveEditedTask(${index})" class="btn btn-primary mt-2" ${task.completed ? 'disabled' : ''}>Guardar</button>
            <button onclick="cancelEditTask(${index})" class="btn btn-secondary mt-2" ${task.completed ? 'disabled' : ''}>Cancelar</button>
        `;

        taskContainer.innerHTML = '';
        taskContainer.appendChild(editForm);

        if (task.completed) {
            taskContainer.querySelector(`input[type="checkbox"]`).disabled = true;
            taskContainer.querySelector('.btn-primary').style.display = 'none';
            taskContainer.querySelector('.btn-secondary').style.display = 'none';
            taskContainer.querySelector('.card-body').style.textDecoration = 'line-through';
        }
    } catch (error) {
        console.error('Error fetching task for editing:', error);
    }
}

async function saveEditedTask(index) {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${index}`);
        let task = await response.json();

        let editedTitle = document.getElementById(`edited-title-${index}`).value;
        let editedDescription = document.getElementById(`edited-description-${index}`).value;

        task.title = editedTitle;
        task.description = editedDescription;

        await fetch(`http://localhost:3000/tasks/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        getTasks();
    } catch (error) {
        console.error('Error saving edited task:', error);
    }
}

function cancelEditTask(index) {
    getTasks();
}

async function deleteTask(index) {
    try {
        await fetch(`http://localhost:3000/tasks/${index}`, {
            method: 'DELETE'
        });
        getTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function handleTaskActions(event) {
    const target = event.target;

    if (target.matches('.btn-primary')) {
        const index = getTaskIndexFromElement(target);
        editTask(index);
    } else if (target.matches('.btn-danger')) {
        const index = getTaskIndexFromElement(target);
        deleteTask(index);
    } else if (target.matches('input[type="checkbox"]')) {
        const index = getTaskIndexFromElement(target);
        toggleCompleted(index);
    }
}

function getTaskIndexFromElement(element) {
    const taskCard = element.closest('.card');
    const taskId = taskCard.id; // Ejemplo: "task-1"
    const index = taskId.split('-')[1]; // Obtener el número después de "task-"
    return parseInt(index);
}

getTasks();
