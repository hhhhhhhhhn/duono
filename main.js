//cookies, taken from https://www.quirksmode.org/js/cookies.html#script

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toUTCString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}

///

window.onbeforeunload = function(){
    if(readCookie("usecookies") == "1"){
        calendarnodes = readCalendarNodes();
        [tasks, dones] =  readTasks();
        createCookie("cnodes", calendarnodes.join("&"))
        createCookie("tasks", tasks.join("&"))
        createCookie("dones", dones.join("&"))
    }
 }

window.onload = ()=>{
        for (var i = 0; i < 48; i++) { //writes dates in calendar
            hours = Math.floor(i/2)
            if (i % 2 == 1){
                minutes = "30"
            }else{
                minutes = "00"
            }

            tasks = document.getElementById("times")
            tasks.insertAdjacentHTML('beforeend', `<li>
                                                        <div>
                                                            <p>${hours}:${minutes}</p>
                                                        </div>
                                                    </li>`);
        }

        for(var ul of document.getElementById("calendar").childNodes){ //adds calendar nodes

            if(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(ul.id)){
                for(var i = 0; i < 48; i++){
                    ul.insertAdjacentHTML('beforeend', `<li>
                    <input type="text" id="calendarnode">
                    </li>`);
                }
            }

        }

        var calendarDiv = document.getElementById("calendar")
        calendarDiv.scrollBy(0, 200 * window.innerHeight/100);
        updateBar()

        cookies = document.cookie                           // Load cookies
        if(!readCookie("usecookies")){
            addTask("1 Task")
            if(confirm("This site uses cookies to preserve your schedule and tasks between visits")){
                createCookie("usecookies", "1")
            }else{
                createCookie("usecookies", "0")
            }
        }else if(readCookie("usecookies") == "1"){
            tasks = readCookie("tasks").split("&")
            dones = readCookie("dones").split("&")
            if(tasks[0] == "" && tasks.length == 1){
                tasks = []
            }
            if(dones[0] == "" && dones.length == 1){
                dones = []
            }
            writeTasks(tasks, dones)
            calendarnodes = readCookie("cnodes").split("&")
            writeCalendarNodes(calendarnodes)
        }

        document.addEventListener('click',function(e){
            if(e.target && e.target.id== "x"){
                  e.target.parentNode.parentNode.parentNode.remove()     //detects removal of task
             }else if(e.target && e.target.id== "add"){
                var text = document.getElementById("addtext").value       //Adds new task
                document.getElementById("addtext").value = ""
                addTask(text, "taskslist")
             }else if(e.target && e.target.id== "v"){
                var task = readTask(e.target.parentNode.parentNode.parentNode)   //Moves task down
                e.target.parentNode.parentNode.parentNode.remove()
                addTask(task, "donelist")
             }else if(e.target && e.target.id== "resetbutton"){
                bothlists = [document.getElementById("taskslist"), document.getElementById("donelist")]   //deletes all tasks
                emptyElements(bothlists)
             }
        });
        document.addEventListener('input', function(e){
            if(e.target.id == "calendarnode"){                  //changes color of calendar node giving it a class
                clas = idNumbers[e.target.value.slice(0,2)]
                e.target.className = clas
            }
        })      
    }

idNumbers = {               //used to change between text an id (for recoloring)
    "1 ":"one",
    "2 ":"two",
    "3 ":"three",
    "4 ":"four",
    "5 ":"five",
    "6 ":"six"
}

function addTask(task, list="taskslist"){ //adds selected class to selected list
    id = idNumbers[task.slice(0,2)]

    tasks = document.getElementById(list)
    tasks.insertAdjacentHTML('beforeend', `<li id=${id}>
                                                <div>
                                                    <p><a id="v" class="v">V</a></p>
                                                    <h2>${task}</h2>
                                                    <p><a id="x" class="x">X</a></p>
                                                </div>
                                            </li>`);
}

function readTask(taskElement){        //gets the text of the task
    return taskElement.querySelector("h2").innerText
}

function emptyElements(list){         //removes all childs of html node
    for(e of list){
        while(e.firstChild){
            e.firstChild.remove()
        }
    }
}

// Start of save / load

function readCalendarNodes(){
    nodes = document.querySelectorAll("[id=calendarnode]")
    values = []
    for (node of nodes){
        values.push(node.value)
    }
    return values
}

function writeCalendarNodes(values){
    nodes = document.querySelectorAll("[id=calendarnode]")
    for (var i = 0; i < values.length; i++){
        nodes[i].value = values[i]
        clas = idNumbers[values[i].slice(0,2)]
        nodes[i].className = clas
    }
}

function readTasks(){
    tasks = []
    dones = []
    for(var task of document.getElementById("taskslist").childNodes){
        if(task.tagName == "LI"){
            tasks.push(readTask(task))
        }
    }
    for(var task of document.getElementById("donelist").childNodes){
        if(task.tagName == "LI"){
            dones.push(readTask(task))
        }
    }
    return [tasks, dones]
}

function writeTasks(tasks, dones){
    for(task of tasks){
        addTask(task)
    }
    for(task of dones){
        addTask(task, "donelist")
    }
}

function resetCalendar(){              // Reset calendar values
    writeCalendarNodes(Array(336).fill(""))
}

// Start of timer

function getPreviousMondayMidnight()      // From Matthew Lymer @ https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday
{
    var date = new Date();
    var day = date.getDay();
    var prevMonday;
    if(date.getDay() == 0){
        prevMonday = new Date().setDate(date.getDate() - 7);
    }
    else{
        prevMonday = new Date().setDate(date.getDate() - day);
    }

    return new Date(prevMonday).setHours(24,0,0,0);
}

function secondsSinceMondayMidnight(){
    return (new Date().getTime() - new Date(getPreviousMondayMidnight()).getTime())/1000
}

function findNextTrueElement(array, index=0){
    for (let i = index; i < array.length; i++) {
        if(array[i]){return i}
    }
    return false
}

function markCalendarNode(index){
    nodes = document.querySelectorAll("[id=calendarnode]")
    if(nodes[index-1].classList.contains("currentnode")){
        nodes[index-1].classList.remove("currentnode")
    }
    if(!nodes[index].classList.contains("currentnode")){
        nodes[index].classList.add("currentnode")
    }
}

function updateBar(){     //updates red bar
    var bar = document.getElementById("bar");
    var secs = secondsSinceMondayMidnight();
    var days = Math.floor(secs / 86400) + 1; // monday is 1 to ease math (86400 secs = 1 day)
    secs %= 86400;
    var [vw, px] = [10 * days, 2 * days];      // a calendar node is 10 vw and 2 px wide
    var vh = (480 * secs) / 86400 // where 480vh = 86400secs
    bar.style.transform = `translate(calc(-${vw}vw - ${px}px), calc(1vh + ${vh}vh - 0.25vh))`;   //the calendar has a 1 vh margin, and the border is .5 vh and needs to be centered
}

var audio = new Audio("bellsound.mp3")

interval = window.setInterval(function(){
    cNodes = readCalendarNodes()
    currentCNode = cNodes[Math.floor(secondsSinceMondayMidnight()/1800)]         // 1800 secs = 0.5 hours, 1500 = 25 mins
    markCalendarNode(Math.floor(secondsSinceMondayMidnight()/1800))
    secondsSinceBlockStart = Math.round(secondsSinceMondayMidnight()%1800)
    if(secondsSinceBlockStart % 30 == 0){updateBar()}
    if(currentCNode.slice(0,2) in idNumbers){
        if(secondsSinceBlockStart < 1500){
            secs = (1500 - secondsSinceBlockStart) % 60
            mins = Math.floor((1500 - secondsSinceBlockStart) / 60)
            document.getElementById("worktext").textContent = `Now Work on ${currentCNode.slice(2)}! ${mins} m, ${secs} s`
        }else{
            secs = (1800 - secondsSinceBlockStart) % 60
            mins = Math.floor((1800 - secondsSinceBlockStart) / 60)
            document.getElementById("worktext").textContent = `Now Rest! ${mins} m, ${secs} s`
        }
        if(secondsSinceBlockStart == 0 || secondsSinceBlockStart == 1500){
            audio.play()
        }
    }else{
        var nextBlock = findNextTrueElement(cNodes, Math.floor(secondsSinceMondayMidnight()/1800))
        if (nextBlock !== false){
            secs = (1800 - secondsSinceBlockStart) % 60
            mins = Math.floor((1800 - secondsSinceBlockStart) / 60) + (30 * (  nextBlock - Math.floor(secondsSinceMondayMidnight()/1800)) )
            hours = Math.floor(mins / 60)
            mins = mins % 60
            document.getElementById("worktext").textContent = `Next Block in ${hours} h, ${mins} minutes and ${secs} s`
        }else{
            document.getElementById("worktext").textContent = `You're free until next week!`
        }
    }
}, 1000);