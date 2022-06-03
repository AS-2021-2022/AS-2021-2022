<script>
import { afterUpdate } from "svelte";


    export let userid;
    var messages = [];
    var last_id = -1;
    
    afterUpdate(() => {

        if(last_id != userid)
        {
            messages = [];
            getMessages(0 , 2);
            console.log("update");
            last_id = userid;
        }
        
    });


    /*async*/ function getMessages(depth , n)
    {
       /* var dict = {"token" : "abc" ,
                    "type"   : "getMessages",
                    "params" : {
                        "userid" : userid ,
                        "depth"    : depth ,
                        "count"   : n
                    }
                };

        const res = await fetch('https://localhost:5000' , {
            method: 'POST',
            body : JSON.stringify(dict) 
        });

        const awnser = await res.json();
        */
        let awnser;
        if(userid == 0xff)  awnser = {0 : {"origin" : "you" , "text" : "User ff"} , 1 : {"origin" : "target" , "text" : "Example of a message"}};
        if(userid == 0xf1)  awnser = {0 : {"origin" : "you" , "text" : "User f1"} , 1 : {"origin" : "target" , "text" : "Example of a message"}};
        if(userid == 0xf3)  awnser = {0 : {"origin" : "you" , "text" : "User f3"} , 1 : {"origin" : "target" , "text" : "Example of a message"}};

        let c = 0;
        console.log(awnser.size);
        for(let i=depth+n-1;i>=depth;i--)
        {
            if(c < Object.keys(awnser).length)
            messages.push(awnser[i-depth]);
            else{
                break;
            }
            c++;
        }
        

    }

    

     function sendMessage()
    {
        
        var h = document.getElementById("message-box");
        if(h.value != "")
        {

            var dict = {"token" : "abc" ,
                    "type"  : "sendMessage" ,
                    "params": {
                        "userid" :   userid ,
                        "message" : h.value
                    }
                };
                   
            /*const res = await fetch('https://localhost:5000' , {
                method: 'POST',
                body : JSON.stringify(dict)
            });
            */
            messages = [...messages , {"origin" : "you" , "text" : h.value}];
            h.value = ""; 
        }
        
    }

</script>

<main>
    <div style = "overflow:auto; opacity:1.0;">
        {#each messages as message}
        <div class = "message">
            {#if message.origin === 'you'}
            <div class = "messageRight">{message.text}</div>
            {:else}
            <div class = "messageLeft">{message.text}</div>
            {/if}
        </div>
        {/each}
    </div>

    <div class = "message-box">
        <textarea id = "message-box" type = "text" class = "message-input" placeholder = "Type message..."></textarea>
        <button class = "message-send" on:click={() => {sendMessage()}}>SEND</button>
    </div>
</main>

<style>
    main
    {
        background-color: #e5e5f7;
        background: repeating-linear-gradient( -45deg, #444cf7, #444cf7 7.5px, #e5e5f7 7.5px, #e5e5f7 37.5px );
        width: 100%;
        display: flex;
        flex-direction: column;
        height:100%;
        overflow:visible;
    }

    .messageLeft
    {
        width: fit-content;
        max-width: 70%;
        margin-left: 50px;
        margin-top: 10px;
        margin-bottom: 10px;
        padding-left:20px;
        padding-right: 20px;
        border-radius: 20px;
        background-color: #f1f1f1f1;
        font-size: 24px;
        float:left;
        height:fit-content;
        clear:both;
        text-align: left;
        color:black;
        overflow-wrap: anywhere;
    }

    .messageRight
    {
        width: fit-content;
        max-width: 70%;
        height:fit-content;
        margin-right:50px;
        margin-top: 10px;
        margin-bottom: 10px;
        padding-left:20px;
        padding-right: 20px;
        border-radius: 20px;
        background-color: rgb(58,132,255);
        float: right;
        font-size: 24px;
        text-align: right;
        color:white;
        clear:both;
        overflow-wrap: anywhere;
    }

    .message-box {
    width: 90%;
    background: #fff; 
    margin:2px auto;

    margin-top: auto;
    display:flex;
    

    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px; 
    
    border:1px solid #ccc;
    
    }

    .message-input {
    background: none;
    float:left;
    border: none;
    resize: none; 
    outline:none;
    /* color: rgba(255, 255, 255, .8);*/
    font-size: 24px;
    height: 50px;
    margin: 0;

    width: 90%;
    color: #444;
    overflow:hidden;
    }

    .message-send
    {
        height:50px;
        width:10%;
        background-color: #f1f1f1f1;
        border:none;
        color:rgb(58, 58, 213);
        outline:none;
        transition-duration: 0.3s;
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
    }

    .message-send:hover
    {
        background-color: rgb(58,132,255);
        color:white;
        transition-duration: 0.3s;
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
    }

    .message
    {
        
    }
</style>