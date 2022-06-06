<script>

    let taskid = "";


    let parameters = undefined;

    parameters = {
        "status" : "accepted",
        "start" : "creation_date",
        "end" : "end_date",
        "priority" : "high" ,
        "description" : "task description here ..."
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
        {#if parameters === undefined}
            <p>Waiting for server response ...</p>
        {:else }
            <div class = "field">{parameters["start"]}</div>
            <div class = "field">{parameters["end"]}</div>
            <p></p>
            <div class = "field">{parameters["priority"]}</div>
            <p></p>
            <div class = "field">{parameters["description"]}</div>
            
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
        background-color:whitesmoke;
        min-height:500px;
        text-align:center;
    }

    .field
    {
        background-color: grey;
        width:fit-content + 20px;
        display:inline-block;
        height:fit-content + 10px;
        padding-left:30px;
        padding-right:30px;
        
    }
</style>