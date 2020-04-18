// Start of initial render

window.onload = ()=>{
        for (var i = 0; i < 48; i++) {                                          // Writes times in calendar
            var hours = Math.floor(i/2)
            if (i % 2 == 1){
                minutes = "30"
            }else{
                minutes = "00"
            }
            var timeHtml =  `<li><div>
                                <p>${hours}:${minutes}</p>
                            </div></li>`
            var times = document.getElementById("times")
            times.insertAdjacentHTML('beforeend', timeHtml)
        }

        for(var ul of document.getElementById("calendar").childNodes){          // Adds calendar nodes
            if(["monday", "tuesday", "wednesday", "thursday", "friday",
            "saturday", "sunday"].includes(ul.id)){
                for(var i = 0; i < 48; i++){
                    ul.insertAdjacentHTML('beforeend', `<li>
                    <input type="text" id="calendarnode">
                    </li>`)
                }
            }
        }

        var calendarDiv = document.getElementById("calendar")                   // Scrolls near current time
        var blocksSinceDayStart = Math.floor
            ((secondsSinceMondayMidnight() % 86400) / 1800) - 1                 // 86400 = seconds in a day, 
        calendarDiv.scrollBy(0,
            calendarNodeHeight() * blocksSinceDayStart * window.innerHeight/100)

        updateBar()

        if(!window.localStorage.getItem("useLS")){                              // Loads local storage (if existing)
            addTask("1 Task")
            if(confirm("This site uses local storage to preserve your " +
            "schedule and tasks between visits")){
                window.localStorage.setItem("useLS", "1")
            }else{
                window.localStorage.setItem("useLS", "0")
            }
        }else if(window.localStorage.getItem("useLS") == "1"){
            var tasks = window.localStorage.getItem("tasks").split("&")
            var dones = window.localStorage.getItem("dones").split("&")
            if(tasks[0] == "" && tasks.length == 1) tasks = []
            if(dones[0] == "" && dones.length == 1) dones = []
            writeTasks(tasks, dones)
            var calendarnodes = window.localStorage.getItem("cnodes").split("&")
            writeCalendarNodes(calendarnodes)
            var settings = window.localStorage.getItem("settings")
            setSettings(settings || "{\n\n}")
        }

        document.addEventListener('click', function(e){                         // Task interaction
            if(e.target && e.target.id== "x"){
                  e.target.parentNode.parentNode.parentNode.remove()
            }else if(e.target && e.target.id== "add"){
                var text = document.getElementById("addtext").value
                document.getElementById("addtext").value = ""
                addTask(text, "taskslist")
            }else if(e.target && e.target.id== "v"){
                var task = readTask(e.target.parentNode.parentNode.parentNode)
                e.target.parentNode.parentNode.parentNode.remove()
                addTask(task, "donelist")
            }else if(e.target && e.target.id== "resetbutton"){
                var bothlists = [document.getElementById("taskslist"),
                    document.getElementById("donelist")]
                emptyUL(bothlists)
            }
        })
        document.addEventListener('input', function(e){                         // Changes calendar node color based on
            if(e.target.id == "calendarnode"){                                  // its text
                var clas = idNumbers[e.target.value.slice(0,2)]
                e.target.className = clas
            }
        })      
    }

var idNumbers = {                                                               // Used for mapping the text on calendar
    "1 ":"one",                                                                 // node with its id (for coloring)
    "2 ":"two",
    "3 ":"three",
    "4 ":"four",
    "5 ":"five",
    "6 ":"six"
}

function addTask(task, list="taskslist"){
    var id = idNumbers[task.slice(0,2)]
    var tasks = document.getElementById(list)
    tasks.insertAdjacentHTML('beforeend', `<li id=${id}><div>
                                                <p><a id="v" class="v">V</a></p>
                                                <h2>${task}</h2>
                                                <p><a id="x" class="x">X</a></p>
                                            </div></li>`)
}

function readTask(taskElement){
    return taskElement.querySelector("h2").innerText
}

function emptyUL(list){
    for(e of list){
        while(e.firstChild){
            e.firstChild.remove()
        }
    }
}

// Start of save / load section

function readCalendarNodes(){
    var nodes = document.querySelectorAll("[id=calendarnode]")
    var values = []
    for (node of nodes){
        values.push(node.value)
    }
    return values
}

function writeCalendarNodes(values){
    var nodes = document.querySelectorAll("[id=calendarnode]")
    for (var i = 0; i < values.length; i++){
        nodes[i].value = values[i]
        var clas = idNumbers[values[i].slice(0,2)]
        nodes[i].className = clas
    }
}

function readTasks(){
    var tasks = []
    var dones = []
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

function resetCalendar(){
    writeCalendarNodes(Array(336).fill(""))
}

function getSettings(){
    return JSON.parse(document.getElementById("settings").value)
}

function setSettings(settings){
    if(typeof settings == "object") settings = JSON.stringify(settings, null, 2)
    document.getElementById("settings").value = settings
}

window.onbeforeunload = function(){
    if(window.localStorage.getItem("useLS") == "1"){
        var calendarnodes = readCalendarNodes()
        var [tasks, dones] =  readTasks()
        window.localStorage.setItem("cnodes", calendarnodes.join("&"))
        window.localStorage.setItem("tasks", tasks.join("&"))
        window.localStorage.setItem("dones", dones.join("&"))
        window.localStorage.setItem("settings", JSON.stringify(getSettings(),
                                                               null, 2))
    }
}

// Start of timer

function getPreviousMondayMidnight(){
    /** From Matthew Lymer @  https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday */
    var date = new Date()
    var day = date.getDay()
    if(day == 0){
        var prevMonday = new Date().setDate(date.getDate() - 7)
    }
    else{
        var prevMonday = new Date().setDate(date.getDate() - day)
    }
    return new Date(prevMonday).setHours(24,0,0,0)
}

function secondsSinceMondayMidnight(){
    return (new Date().getTime() - new Date(getPreviousMondayMidnight())
        .getTime())/1000
}

function findNextTrueElement(array, index=0){
    for (let i = index; i < array.length; i++) {
        if(array[i]){return i}
    }
    return false
}

function outlineCalendarNode(index){
    var nodes = document.querySelectorAll("[id=calendarnode]")
    if(nodes[index-1].classList.contains("currentnode")){
        nodes[index-1].classList.remove("currentnode")
    }
    if(!nodes[index].classList.contains("currentnode")){
        nodes[index].classList.add("currentnode")
    }
}

function updateBar(){                                                           // Updates red bar
    var bar = document.getElementById("bar")
    var secs = secondsSinceMondayMidnight()
    var days = 7 - Math.floor(secs / 86400)                                     // Days are in reverse to ease math
    secs %= 86400
    var [vw, px] = [10 * days, 2 * days]                                        // A calendar node is 10 vw + 2 px wide
    var vh = (48 * calendarNodeHeight() * secs) / 86400                         // Where 48 = amount of calendar nodes
    bar.style.transform =                                                       // The calendar has a 1 vh margin, and 
        `translate(calc(-${vw}vw - ${px}px), calc(1vh + ${vh}vh - 0.25vh))`     // the bar is .5 vh and needs to be
}                                                                               // centered

var interval = window.setInterval(function(){
    var cNodes = readCalendarNodes()
    var currentCNodeIndex = Math.floor(secondsSinceMondayMidnight()/1800)
    var currentCNode = cNodes[currentCNodeIndex]                                // 1800 secs = 0.5 hours, 1500 = 25 mins
    var secondsSinceBlockStart = Math.floor(secondsSinceMondayMidnight()%1800)
    outlineCalendarNode(currentCNodeIndex)

    if(secondsSinceBlockStart % 30 == 0) updateBar()

    if(currentCNode.slice(0,2) in idNumbers){                                   // i.e if it's colored
        if(secondsSinceBlockStart < 1500){
            var secs = (1500 - secondsSinceBlockStart) % 60
            var mins = Math.floor((1500 - secondsSinceBlockStart) / 60)
            document.getElementById("worktext").textContent = 
                `Now Work on ${currentCNode.slice(2)}! ${mins} m, ${secs} s`
        }else{
            var secs = (1800 - secondsSinceBlockStart) % 60
            var mins = Math.floor((1800 - secondsSinceBlockStart) / 60)
            document.getElementById("worktext").textContent = 
                `Now Rest! ${mins} m, ${secs} s`
        }
        if(secondsSinceBlockStart == 1 || secondsSinceBlockStart == 1500){
            var audio = new Audio(getSettings().audio || "bellsound.mp3")
            audio.play()
        }
    }else{
        var nextBlockIndex = findNextTrueElement(cNodes, currentCNodeIndex) - 1
        if (nextBlockIndex !== -1){                                             // If there is another element
            var secs = (1800 - secondsSinceBlockStart) % 60
            var mins = Math.floor((1800 - secondsSinceBlockStart) / 60) +       // Minutes left in this block plus
                (30 * (nextBlockIndex - currentCNodeIndex))                     // 30 * the amount of blocks left
            var hours = Math.floor(mins / 60)
            mins %= 60
            if(mins >= 0) document.getElementById("worktext").textContent = 
                `Next Block in ${hours} h, ${mins} m and ${secs} s`
            else document.getElementById("worktext").textContent = 
                `Now work on ${currentCNode}!`
        }else{
            document.getElementById("worktext")
                .textContent = `You're free until next week!`
        }
    }
}, 1000)

// Start of Zooming behaviour

function setCalendarNodeHeight(heightInVH){
    document.documentElement.style
        .setProperty("--cnode-vertical-height", `${heightInVH}vh`)
}

function calendarNodeHeight(){
    var value = window.getComputedStyle(document.documentElement)
        .getPropertyValue("--cnode-vertical-height")
    return parseFloat(value.slice(0,-2))
}

document.addEventListener('keydown', function(e){
    if(e.keyCode == 187){
        setCalendarNodeHeight(calendarNodeHeight() * 1.25)
        document.getElementById('calendar').scrollTop *= 1.25
        updateBar()
        document.activeElement.blur()
    }else if(e.keyCode == 189){
        setCalendarNodeHeight(calendarNodeHeight() * 0.8)
        document.getElementById('calendar').scrollTop *= 0.8
        updateBar()
        document.activeElement.blur()
    }
})
