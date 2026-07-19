// * OPEN CONSOLE -> Application Tab

// * setItem(key , value )
localStorage.setItem('Language 1' , 'JAVASCRIPT')
localStorage.setItem('Language 2' , 'PYTHON')
localStorage.setItem('Language 3' , 'C#')


// * getItem(key)
console.log(localStorage.getItem('Language 1')); // * JAVASCRIPT

// * removeItem(key)
localStorage.removeItem('Language 3'); // * C#


// * clear()
// localStorage.clear()

// * key()
console.log(localStorage.key(0)) // * Language 1 
console.log(localStorage.key(4)) // * null