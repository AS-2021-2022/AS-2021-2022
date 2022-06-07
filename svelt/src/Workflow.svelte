<script>
    import { afterUpdate } from "svelte";

    export let workflowid;
    var last_id = -1;


    afterUpdate(() => {
    
    if(last_id != workflowid)
    {
        last_id = workflowid;
    }

    });

    function getWorkflow()
    {
        return {"status" : "accepted" , "name" : "workflow name" , "progress" : 1 ,
        "steps" : [{"assignee_id" : "id" , "description" : "description text"} , {"assignee_id" : "id2" , "description" : "DESC2"}]};
    }

    let apiResponse = getWorkflow();


</script>


<main>
    Workflow {workflowid}
    
    <div class = "box">

        {#each apiResponse["steps"] as step , index}
            <div class = "step">
                <div class = "description">{step["description"]}</div>
                {#if index < apiResponse["progress"]}
                    <div class = "circle" style="background-color:greenyellow"></div>
                {:else}
                
                <div class = "circle" style="background-color:red"></div>
                {/if}
                    <div>-></div>

            </div>

            
        {/each}


    </div>
    


</main>


<style>

    .box
    {
        width: 95%;
        text-align:center;
        height: fit-content;
        background-color: aliceblue;
    }

    .step
    {
        display:inline-block;
        width:200px;
        height:50px;
        margin-left:50px;
        margin-right:50px;
        background-color:grey;
    }

    .description
    {
        width:200px;
        height:100px;
    }

    .circle
	{
		height: 25px;
		width: 25px;
		background-color: rgb(123, 89, 89);
		border-radius: 50%;

	}

    .arrow {
    width: 50px;
    height: 25px;
    background: url("http:unsplash.it/400x300");
}

</style>