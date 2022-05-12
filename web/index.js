const chat = `<div class = "chat">

<div class = "receiveBox" id = "rcvBox"> 

</div>

<div class = "sendBox">
    <textarea placeholder = "Message ... " class = "sendMessage" id = "sndMessage"> </textarea>
    <div class = "sendMessageMenu">
        <button onclick = "sendMessage()">send</button>
    </div>
</div>
</div>`;


var listOfMessages = [];

function setContext(type)
{
    v = document.getElementById("ctx");
    if(type == "chat")
    {
        v.innerHTML = chat;
        displayMessages();
    }
    else{
        v.innerHTML = "";
    }
}

function displayMessage(string , from)
{
    v = document.getElementById("rcvBox");
    console.log((string , from));
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
    newMessage(v.value , 'left');
}