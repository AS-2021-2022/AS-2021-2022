<script>
    import { afterUpdate } from "svelte";
    export let taskid;
    let state = "";
    let last_id = -1;
    if(taskid == undefined) state = "write";
    else{
        state = "read";
    }

    afterUpdate(() => {
    if(last_id != taskid)
    {
        if(taskid == 1)
    {
        parameters = {
            "status" : "accepted",
            "start" : "6/6 - 15:00",
            "end" : "7/6 - 14:00",
            "priority" : "Alta" ,
            "description" : "Descrição detalhada da tarefa aqui"
        }
    }
    if(taskid == 2)
    {
        parameters = {
            "status" : "accepted",
            "start" : "5/6 - 15:00",
            "end" : "6/6 - 14:00",
            "priority" : "Baixa" ,
            "description" : "Descrição detalhada da tarefa aqui"
        }
    }
        last_id = taskid;
    }

    });
    
    let parameters = undefined;
    console.log(taskid);
    

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
                
                <p></p>
                <div class = "field" style="background-color:rgb(231, 231, 231);">Priority : </div><div class = "field">{parameters["priority"]}</div>
                <p></p>
                <div class = "field" style="background-color:rgb(231, 231, 231);">Progress : </div><input type="range" min="0" max="100" value="0"><div></div>
                <p></p>
                <div class = "field" style="background-color:rgb(231, 231, 231);">Start : </div><div class = "field">{parameters["start"]}</div>
                <div class = "field" style="background-color:rgb(231, 231, 231);">End : </div><div class = "field">{parameters["end"]}</div>
                <p></p>
                <div class = "field description" >{parameters["description"]}</div>
                
                <p></p>
                
                <p></p>
                
                
                <button class = "concludeButton" on:click={() => {

                    console.log("remove task");

                }}>Conclude task!</button>
                
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
        padding-bottom:50px;
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
        width:fit-content;
        height:fit-content;
        background-color: rgb(201, 201, 201);
    }

    .concludeButton:hover
    {
        background-color: rgb(171, 171, 171);
    }

        .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 25px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
    }

    .slider:hover {
    opacity: 1;
    }

    .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    background: #04AA6D;
    cursor: pointer;
    }

    .slider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    background: #04AA6D;
    cursor: pointer;
    }

    
</style>