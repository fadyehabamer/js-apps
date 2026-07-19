// * Check Support of Browser For local storage 

// * Way 1
(window.localStorage) ? alert('LS Supported 1') : alert('LS NOT SUPPORTED 1')

(typeof(Storage) !== undefined) ? alert('LS Supported 2') : alert('LS NOT SUPPORTED 2')