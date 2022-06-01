<script>
	
	var sidebar_title = "";
	let options = [];
	function updateSideBar(type)
	{
		getOptions(type);
		switch(type)
		{
			case 'chat':
			sidebar_title = "chat";
			break;

			case 'tasks':
			sidebar_title = "tasks";
			break;

			case 'workflows':
			sidebar_title = "workflows";
			break;
		}
	}

	function getOptions(type) //send http request in order to get list of options (tasks, workflows , etc...)
	{
		options = [];
		switch(type)
		{
			case 'chat':
			options = [{name: 'Jonh Doe' , color: 'red'} , {name: 'Jane Doe',  color:'green'}];
			break;

			case 'tasks':
			options = [{name: 'contact1' , color: 'red'} , {name: 'contact2',  color:'green'}];
			break;
		}
	}

	
</script>


<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">

</svelte:head>

<main>
	
	<nav class="navbar navbar-expand-md navbar-dark bg-info">
		<a href="/" class="navbar-brand"><i class="bi bi-house"></i></a>
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar6">
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="navbar-collapse collapse justify-content-stretch" id="navbar6">
			<ul class="navbar-nav">
				<li on:click={() => updateSideBar('chat')} class="nav-item active">
					<a class="nav-link active" href="#" >Chat<i class="bi bi-arrow-right"></i></a>
				</li>
				<li on:click={() => updateSideBar('tasks')} class="nav-item">
					<a class="nav-link active" href="#" >Tasks<i class="bi bi-arrow-right"></i></a>
				</li>
				<li on:click={() => updateSideBar('workflows')} class="nav-item">
					<a class="nav-link active" href="#">Workflows<i class="bi bi-arrow-right"></i></a>
				</li>
				<li class="nav-item">
					<a class="nav-link active" href="#">Files<i class="bi bi-arrow-right"></i></a>
				</li>
			</ul>
			<ul class="navbar-nav ml-auto">
				<li class="nav-item">
					<a class="nav-link active" href="#"> <i class="bi bi-envelope"></i>  xyz@empresa.pt</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="login">Sign out <i class="bi bi-door-closed"></i></a>
				</li>
			</ul>
		</div>
	</nav>

	<div class="d-flex flex-column flex-shrink-0 p-3 bg-light" style="width: 280px;height:100vh;">
		<div class="sidebar-content">{sidebar_title}</div>
		{#each options as option}
		<div class="sidebar-content">{option.name} <div class="circle" style="background-color:{option.color};"></div></div>
		{/each}
		
	</div>
</main>

<style>
	main {
		
		padding: 0em;
		max-width: 240px;
		margin: 0 auto;
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

	.circle
	{
		height: 25px;
		width: 25px;
		background-color: #bbb;
		border-radius: 50%;
		display: inline-block;
		float:right;
		
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>