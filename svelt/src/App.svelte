<script>
	import Chat from "./Chat.svelte";
	import userid from "./Chat.svelte";
	import Tasks from "./Tasks.svelte";
	var sidebar_title = "";
	let options = [];
	let selected_user = 0;
	let nav_active = "chat";
	function updateSideBar(type)
	{
		document.getElementById(nav_active).classList.remove("active");
		document.getElementById(type).classList.add("active");
		nav_active = type;

		getOptions(type);
		switch(type)
		{
			case 'chat':
			sidebar_title = "chat";
			selected_user = 0;
			break;

			case 'tasks':
			sidebar_title = "tasks";
			break;

			case 'workflows':
			sidebar_title = "workflows";
			break;

			case 'files':
			sidebar_title = "files";
			break;
		}
	}

	function selected(index)
	{
		
		switch(nav_active)
		{
			case 'chat':
			
			selected_user = options[index]["id"];
			
			break;
		}
	}

	function decodeColor()
	{
		for(let i=0;i<options.length;i++)
		{
			switch(nav_active)
			{
				case 'chat':
				if(options[i]["status"] == "offline")
				{
					options[i]["color"] = "grey";
					delete options[i].status;
				}
				if(options[i]["status"] == "online")
				{
					options[i]["color"] = "green";
					delete options[i].status;
				}
				if(options[i]["status"] == "busy")
				{
					options[i]["color"] = "red";
					delete options[i].status;
				}
				break;
			}
		}

		console.log(options);
		options = options;
	}

	function getOptions(type) //send http request in order to get list of options (tasks, workflows , etc...)
	{
		
		options = [];
		switch(type)
		{
			case 'chat':
			options = [{"name": 'Jonh Doe' , "status": 'offline' , 'id' : 0xff} , {"name": 'Jane Doe',  "status":'online' , "id" : 0xf1} , {"name" : 'User3' , 'status' : "busy" , "id" : 0xf3}];
			decodeColor();
			break;

			case 'tasks':
			options = [{name: 'Tarefa 1' , color: 'red'} , {name: 'Tarefa 2',  color:'green'}];
			break;

			case 'workflows':
			options = [{name: 'Workflow 1' , color: 'red'} , {name: 'Workflow 2',  color:'green'}];
			break;
		}
	}
	
	
</script>



<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">

</svelte:head>

<main>
	
	<nav class="navbar navbar-expand-md navbar-dark bg-primary active">
		<a href="/" class="navbar-brand"><i class="bi bi-house"></i></a>
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar6">
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="navbar-collapse collapse justify-content-stretch" id="navbar6">
			<ul class="navbar-nav">
				
				<li on:click={() => updateSideBar('chat')} class="nav-item" id="chat">
					<a class="nav-link" href="#">Chat<i class="bi bi-arrow-right"></i></a>
				</li>
				<li on:click={() => updateSideBar('tasks')} class="nav-item" id="tasks">
					<a class="nav-link " href="#" >Tasks<i class="bi bi-arrow-right"></i></a>
				</li>
				<li on:click={() => updateSideBar('workflows')} class="nav-item" id="workflows">
					<a class="nav-link " href="#">Workflows<i class="bi bi-arrow-right"></i></a>
				</li>
				<li on:click={() => updateSideBar('files')} class="nav-item" id="files">
					<a class="nav-link " href="#">files<i class="bi bi-arrow-right"></i></a>
				</li>
			</ul>
			<ul class="navbar-nav ml-auto">
				<li class="nav-item">
					<a class="nav-link " href="#"> <i class="bi bi-envelope"></i>  xyz@empresa.pt</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="login">Sign out <i class="bi bi-door-closed"></i></a>
				</li>
			</ul>
		</div>
	</nav>

	

	<div>
		<div style="width:280px;Text-align:left;float:left;background-color:gainsboro;">
			<div class="d-flex flex-column flex-shrink-0 p-3" style="width: 280px;height:90vh;">
				<div class="sidebar-content">{sidebar_title}</div>
				{#each options as option , index}
				<div on:click={() => {selected(index)}}>
					<div class="sidebar-content">{option.name} <div class="circle" style="background-color:{option.color};"></div></div>
				</div>
				{/each}
				
			</div>
		</div>
		<div style="Text-align:right;width:calc(100% - 280px);float:right;height:90vh;">
			{#if nav_active == "chat" && selected_user != 0}
					<Chat userid = {selected_user}></Chat>
			
			{/if}

			{#if nav_active == "tasks"}

					<Tasks>	</Tasks>

			{/if}

		
</div>
	
</main>

<style>
	
	main {
		
		padding: 0em;
		max-width: 240px;
		margin: 0 auto;
	}

	.active
	{
		background: black;
	}
	

	.navbar-nav > li{
  		padding-left:30px;
  		padding-right:30px;
	}

	.sidebar-content{
  		padding-top: 20px;
		padding-bottom: 20px;
		text-align:left;

	}
	.sidebar-content:hover{
		background-color: grey;
	}

	.circle
	{
		height: 25px;
		width: 25px;
		background-color: #bbb;
		border-radius: 50%;
		display: inline-block;
		float:right;
		
	}

	.content
	{
		width:10%;
		
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>