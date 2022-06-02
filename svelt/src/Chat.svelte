<script>

    var messages = [{'text' : 'hello' , 'position' : 'left'} , {'text' : 'world' , 'position' : 'right'} ];

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
        background: blue;
        width:100%;
        height:100%;
        text-align:left;
    }

    .messageLeft
    {
        background-color: grey;
        width: 100%;
        float:left;
    }

    .messageRight
    {
        float:right;
        background-color: red;
        width: 100%;
    }
</style>