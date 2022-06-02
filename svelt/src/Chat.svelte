<script>


    export let userid;
    var messages = [{'text' : 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum  will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)'
, 'position' : 'left'} , {'text' : 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum  will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)' , 'position' : 'right'} , {'text' : 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum  will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)'
, 'position' : 'left'}];

    

    async function sendMessage()
    {
        console.log(userid);
        var h = document.getElementById("message-box");
        if(h.value != "")
        {

            var dict = {"token" : "abc" ,
                    "type"  : "sendMessage" ,
                    "params": {
                        "1" :   userid ,
                        "2" : h.value
                    }
                };
                h.value = "";    
            const res = await fetch('https://localhost:5000' , {
                method: 'POST',
                body : JSON.stringify(dict)
            })

            
           
        }

        
        
    }

</script>

<main>
    <div style = "overflow:auto; opacity:1.0;">
        {#each messages as message}
        <div class = "message">
            {#if message.position == 'left'}
            <div class = "messageLeft">{message.text}</div>
            {:else}
            <div class = "messageRight">{message.text}</div>
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
        background-color: rgb(58,132,255);
        font-size: 30px;
        float:left;
        height:fit-content;
        clear:both;
        text-align: left;
        color:white;
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
        background-color: #f1f1f1f1;
        float: right;
        font-size: 30px;
        text-align: right;
        
        clear:both;
    }

    .message-box {
    flex: 0 1 42px;
    width: 90%;
    background: #fff; 
    margin:2px auto;

    position: relative;
    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px; 
    height:50px;
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
</style>