const chat_context = `<div class = "chat">

<div class = "receiveBox" id = "rcvBox"> 

</div>

<div class = "sendBox">
    <textarea placeholder = "Message ... " class = "sendMessage" id = "sndMessage"></textarea>
    <div class = "sendMessageMenu">
        <button onclick = "sendMessage()">send</button>
    </div>
</div>
</div>`;

const tasks_context = `
    <div>Tasks context</div>
    <div>Everything about the selected task should appear here.</div>
`

const workflows_context = `
    <div>Everything about the selected workflow should appear here.</div>
`

const chat_menu = `
    <div id = "contacts" class = 'contacts'></div>
`
const tasks_menu = `
    <div>A list of active / non active tasks will be shown here.</div>
    <button onclick = 'setContext("tasks")'> go to tasks</button>
    `

const workflows_menu = `
<div>The list of current workflows will be shown here.</div>
<button onclick = 'setContext("workflows")'> go to workflows</button>
`

var clicked = [];
var listOfMessages = [];
function getContacts()
{
    return [["John Doe"] , ["Jane Doe"]];
}

function setContext(type)
{
    v = document.getElementById("ctx");
    if(type == "chat")
    {
        v.innerHTML = chat_context;
        displayMessages();
    }
    if(type == "tasks")
    {
        v.innerHTML = tasks_context;
    }
    if(type == "workflows")
    {
        v.innerHTML  = workflows_context;
    }
    
}

function displayMessage(string , from)
{
    v = document.getElementById("rcvBox");
    if(from == "left")
    {
        v.innerHTML += "<div class='messageLeft'>" + string + "</div>";
    }
    if(from == "right")
    {
        v.innerHTML += "<div class='messageRight'>" + string + "</div>";
    }
}

function displayMessages()
{
    document.getElementById("rcvBox").innerHTML = "";
    for(let i = 0 ; i<listOfMessages.length;i++)
    {
        displayMessage(listOfMessages[i][0] , listOfMessages[i][1]);
    }
}

function newMessage(str , from)
{
    listOfMessages.push([str , from]);
    displayMessages();
}

function sendMessage()
{
    var v = document.getElementById("sndMessage");
    for(let i=0;i<v.value.length ; i++) //avoid empty messages
    {
        if(v.value[i] != " ")
        {
            newMessage(v.value , 'left');
            v.value = "";
            break;
        }
    }
}

function toggleMenu(id)
{
    var v = document.getElementById(id);
    
    if(clicked[id] == null)
    {
        clicked[id] = false;
    }
    clicked[id] = !clicked[id];
    var state = clicked[id];
    if(state == true)
    {
        if(id == "chat_menu")
        {
            v.innerHTML = chat_menu;
            setChatMenu();
        }
        if(id == "tasks_menu")
        {
            v.innerHTML = tasks_menu;
        }
        if(id == "workflows_menu")
        {
            v.innerHTML = workflows_menu;
        }
    }
    else{
        v.innerHTML = "";
    }
}

function loadChat(identifier)
{
    if(identifier == "John Doe")
    listOfMessages = [["John Doe chat example" , "right"]];
    if(identifier == "Jane Doe")
    listOfMessages = [["Jane Doe chat example" , "right"]];
}

function setChatMenu()
{
    data = getContacts();
    for(let i=0;i<data.length;i++)
    {
        let name = data[i][0];
        v = document.getElementById("contacts");
        v.innerHTML += `<div class = 'contact'><div class = 'contactName' onclick="loadChat('` + name + `') ; setContext('chat')">` + name + `</div> <div class = 'contactStatus'>status</div></div>`
    }
}