// * Session storage Example .. have the same methods as Local Storage 
sessionStorage.setItem('HI', 1243)


// * Store json and check items

/*
    * Storing Json Object
    *   Json.Stringify 
    *   Json.Parse
    
    * Check for items
    *   length()
*/

const fady = {
    name: 'FADY',
    age: 21,
    PL: 'JS'
}

// * convert object to STRING to make local storage understand what to store
localStorage.setItem('Person', JSON.stringify(fady))


// * Retrive Data as Object not as a String
console.log(JSON.parse(localStorage.getItem('Person')));



// * Check if there is Items in Local Storage
(localStorage.length > 0) ? alert('ITEMS FOUNDED') : alert('NO ITEMS FOUNDED')