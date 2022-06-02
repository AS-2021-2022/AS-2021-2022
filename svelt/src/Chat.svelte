<script>

    var messages = [{'text' : 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum  will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)'
, 'position' : 'left'} , {'text' : 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum  will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)' , 'position' : 'right'} , {'text' : 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum  will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)'
, 'position' : 'left'}];

    function getMessages()
    {

    }

</script>

<main>
    {#each messages as message}
    <div class = "message">
        {#if message.position == 'left'}
        <div class = "messageLeft">{message.text}</div>
        {:else}
        <div class = "messageRight">{message.text}</div>
        {/if}
    </div>
    {/each}
</main>

<style>
    main
    {
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
</style>