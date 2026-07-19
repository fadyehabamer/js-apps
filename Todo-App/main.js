let input = document.querySelector("input"),
    addbtn = document.querySelector(".plus"),
    taskscont = document.querySelector(".tasks-content")
taskscount = document.querySelector(".tasks-count span")
taskscomplete = document.querySelector(".tasks-completed span");


// focus on input
window.onload = () => {
    input.focus();
}

// add tasks !
addbtn.onclick = () => {
    // if input is empty
    if (input.value == "") {
        Swal.fire({
              title: 'Can not make Empty Task !',
              width: 600,
              padding: '3em',
              backdrop: `
                rgba(0,0,123,0.4)
                left top
                no-repeat
              `
            })
    }
    else {

        no = document.querySelector(".no")
        // check if no tasks msg exists
        if (document.body.contains(document.querySelector(".no"))) {
            // remove no task msg
            no.remove()
        }

        // create span element
        let mainspan = document.createElement("span");
        // create del btn
        let delspan = document.createElement("span");

        // create text to main span
        let maintext = document.createTextNode(input.value)

        // create text to del span
        let deltext = document.createTextNode("Delete")


        // add text to span , class
        mainspan.appendChild(maintext)
        mainspan.className = "task-box"

        // add text to del span , class
        delspan.appendChild(deltext)
        delspan.className = "delete"


        // add delete btn to main span
        mainspan.appendChild(delspan)

        // add main span to task container
        taskscont.appendChild(mainspan)

        // delete input content after create task
        input.value = ""

        // focus on field
        input.focus();

        // calc task
        calctask();

    }
}

document.addEventListener("click", function (e) {

    // delete task
    if (e.target.className == "delete") {
        e.target.parentNode.remove()
        calctask()
    }
    // check nom of tasks
    if (taskscont.childElementCount == 0) {
        notasks()
    }

    // finish task
    if (e.target.classList.contains("task-box")) {
        e.target.classList.toggle("finished")
        calctask();
    }
})


// function no tasks to show after all completed
function notasks() {
    // create msg span 
    let msgspan = document.createElement("span")

    // create text no msg
    let notextmsg = document.createTextNode("No tasks to show")

    // add text to msg span
    msgspan.appendChild(notextmsg)
    msgspan.className = "no"

    // append msg span to task container
    taskscont.appendChild(msgspan)
}

// claculate task
function calctask(){

    // all tasks
    taskscount.innerHTML = document.querySelectorAll(".task-box").length

    // completed
    taskscomplete.innerHTML = document.querySelectorAll(".finished").length



}
