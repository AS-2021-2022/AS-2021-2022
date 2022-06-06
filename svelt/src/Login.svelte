<script>

  export let logged = false;



async function login () {


    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;
		const res = await fetch('https://localhost:5000', {
			method: 'POST',
			body: JSON.stringify({
        "type" : "login",
        "username" : user,
        "password" : pass
			})
		})
		
		const json = await res.json()
		result = JSON.stringify(json)

    if(result["status"] == "accepted")
    {
      logged = true;
    }
	}

</script>


<main>
    <div class = "title">NSN - Seguros</div>
    <div class="wrapper">
        <div class="form-signin">       
          <h2 class="form-signin-heading">Please login</h2>
          <input type="text" class="form-control" id="user" placeholder="Email Address" required="" autofocus="" />
          <input type="password" class="form-control" id="pass" placeholder="Password" required=""/>      

          <button class="btn btn-lg btn-primary btn-block" on:click={()=>{login();}}>Login</button>   
        </div>
      </div>
</main>



<style>
   
   .title
   {
    font-size:30px;
    text-align:center;
    margin-top:50px;
   }
 .wrapper {
	 margin-top: 80px;
	 margin-bottom: 80px;
}
 .form-signin {
	 max-width: 380px;
	 padding: 15px 35px 45px;
	 margin: 0 auto;
	 background-color: #fff;
	 border: 1px solid rgba(0, 0, 0, 0.1);
}
 .form-signin .form-signin-heading, .form-signin .checkbox {
	 margin-bottom: 30px;
}
 .form-signin .checkbox {
	 font-weight: normal;
}
 .form-signin .form-control {
	 position: relative;
	 font-size: 16px;
	 height: auto;
	 padding: 10px;
}
 .form-signin .form-control:focus {
	 z-index: 2;
}
 .form-signin input[type="text"] {
	 margin-bottom: -1px;
	 border-bottom-left-radius: 0;
	 border-bottom-right-radius: 0;
}
 .form-signin input[type="password"] {
	 margin-bottom: 20px;
	 border-top-left-radius: 0;
	 border-top-right-radius: 0;
}
 


</style>