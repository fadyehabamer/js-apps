function notGate(str) {
    let newstr = "";
    for (let letter of str) {
        if (letter === "1") {
            letter = "0"
        } else if (letter === "0") {
            letter = "1"
        }
        newstr += letter
    }
    return newstr


}
// example
notGate("011x0x"); // 100x1x