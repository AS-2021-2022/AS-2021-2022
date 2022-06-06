<script>

    let taskid = "";
    let state = "";
    if(taskid == undefined) state = "write";
    else{
        state = "read";
    }
    
    let parameters = undefined;

    parameters = {
        "status" : "accepted",
        "start" : "6/6 - 15:00",
        "end" : "7/6 - 14:00",
        "priority" : "Alta" ,
        "description" : "Descrição detalhada da tarefa aqui"
    }

    async function getTask(id)
    {
        
        //send task id in request
        var dict = {"token" : "abc" ,
                    "type"   : "getTask",
                    "params" : {
                        "id" : taskid
                    }
                };

        const res = await fetch('https://localhost:5000' , {
            method: 'POST',
            body : JSON.stringify(dict) 

        });

        if(res["status"] === "accepted")
        {
            return res;
        }
        else{
            
        }
        
    }

</script>


<main>

    <div class = "taskBox">
        {#if state === "read"}

            {#if parameters === undefined}
                <p>Waiting for server response ...</p>
            {:else }
                <p></p>
                <div class = "field" style="background-color:rgb(231, 231, 231);">Start : </div><div class = "field">{parameters["start"]}</div>
                <div class = "field" style="background-color:rgb(231, 231, 231);">End : </div><div class = "field">{parameters["end"]}</div>
                <p></p>
                <div class = "field" style="background-color:rgb(231, 231, 231);">Prioridade : </div><div class = "field">{parameters["priority"]}</div>
                <p></p>
                <div class = "field description" >{parameters["description"]}</div>
                <p></p>
                <button class = "concludeButton"></button>
                
            {/if}
        {:else}
            <!--Task creation here-->


        {/if}



    </div>

</main>


<style>

    .taskBox
    {
        width : 40%;
        margin: 0 auto;
        height: fit-content;
        margin-top:100px;
        background-color:rgb(231, 231, 231);
        min-height:500px;
        text-align:center;
    }

    .field
    {
        background-color: white;
        width:fit-content + 20px;
        display:inline-block;
        height:fit-content + 10px;
        padding-left:30px;
        padding-right:30px;
        margin-top:30px;
        min-height:30px;
        font-size:24px;
    }
    .description
    {
        min-height: 200px;
    }

    .concludeButton
    {
        width:50px;
        height:20px;
        background-color: green;
    }

    
</style>