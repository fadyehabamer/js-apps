let form = document.querySelector('form')
let ul = document.querySelector('ul')
let input = document.querySelector('#todo')
let clear = document.querySelector('#clear')

const Todos = JSON.parse(localStorage.getItem('tasks')) ? JSON.parse(localStorage.getItem('tasks')) : []

// create and append li
const createLi = (text) => {
    // * way 1 [I dont Like it]
    let li = document.createElement('li')
    li.textContent = text
    ul.appendChild(li)

    // * Way 2 [ I Like It ]
    // ul.innerHTML += `
    //     <li> ${text} </li>
    // `
}

const savedTodos = JSON.parse(localStorage.getItem('tasks')) ? JSON.parse(localStorage.getItem('tasks')) : []

savedTodos.map((item) => {
    createLi(item)
})



form.addEventListener('submit', (e) => {
    e.preventDefault();
    createLi(input.value);
    Todos.push(input.value)
    // add to local storage
    localStorage.setItem('tasks', JSON.stringify(Todos))
    input.value = '';
})

clear.addEventListener('click', () => {
    localStorage.clear();
    ul.innerHTML = ''
})
