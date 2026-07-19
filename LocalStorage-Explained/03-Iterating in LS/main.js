// * Iterating in LOCAL Storage
localStorage.clear();

localStorage.setItem('Language 1', 'JS')
localStorage.setItem('Language 2', 'PYTHON')
localStorage.setItem('Language 3', 'C#')
localStorage.setItem('Language 4', 'C++')
localStorage.setItem('Language 5', 'JAVA')


for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i)
    console.log(key, localStorage.getItem(key))
}