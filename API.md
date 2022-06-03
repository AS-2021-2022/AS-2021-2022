#### GENERIC REQUEST STRUCTURE
```
{
    "token" : "user_token" ,
    "type"  : "request type",
    "params":
    {
        "param1" : "..." ,
         ....
        "paramn" : "..."
    }
}
```

//notes
When "params" field is empty, the server doesn't need to send it.

#### GENERIC SERVER RESPONSE
A)
```
    {
        "status" : "rejected" ,
        "info"   : "error message information" (optional, some requests may not receive this information field)
    }
```

B)
```

    {
        "status" : "accepted" ,
        ... (data fields here)
    }
   ```

# List of API calls (brief)

## 1. - login
    1.0 login                       (used to get access token)
## 2. - chat
    
    2.0 getContactsList             (returns a brief list of user associated contacts)
    2.1 sendMessage                 (send a message to the server)
    2.2 getContactMessages          (returns the current selected contact messages)
## 3. files
    3.0 getFilesList                (returns a brief list of user associated files)
    3.1 getFile                     (when user asks for a file (download))
    3.2 uploadFile                  (when user sends a file)
## 4. Workflows
    4.0 getWorkflows                (returns a brief list of user associated workflows)
    4.1 incrementWorkflow           (when user increments workflow (send file))
    4.2 getWorkflow                 (returns a workflow information)
## 5. Tasks
    5.0 getTasksList                (returns a brief list of tasks)
    5.1 getTask                     (returns selected task information)
    5.2 assignTask                    (user creates a task)


# detailed description of the API calls


## 1. login
## 1.0 - login
  ####  User request
    {
        "token" : "none" ,
        "type"  : "login",
        "params": 
        {
            "username" : "username",
            "password" : "user password" 
        }
    }
 #### Server response
        {
            "status" : "accepted" ,
            "token" : "server_token"  
        }

## 2. Chat
### 2.0 - getContactsList
 ####  User request
    {
        "token" : "user_token" ,
        "type"  : "getContactsList"
    }

#### Server response
    {
        "status" : "accepted" ,
        "users": [{"name" : "PESSOA A" , "status" : "user status" , "id" : "PESSOA A id} , ... {...}] ,
        "groups" : [{"name" : "GROUP A" , "id" : "GROUP A id} , ... , {...}]
    }

  User can have one of these states (online , offline , busy)
 The ID must be unique which represents a single user / chat group


### 2.1 - sendMessage
 #### User request
        {
            "token" : "user_token" ,
            "type"  : "sendMessage",
            "params" :
            {
                "target id" : "id received in 2.0 request" ,
                "message"   : "message written by user"
            }
        }

 #### Server response (optional)
   A)
   
        {
            "status" : "accepted"
        }
        

#### Errors
   - User / group ID is unknown
   - User does not have permission to talk with this user / group.


### 2.2 getContactMessages
 #### User request
        {
            "token" : "user_token" ,
            "type"  : "getContactMessages",
            "params" :
            {
                "target_id" : "id received in 2.0 request" ,
                "depth"   : 0 is the most recent message, 1 -> second most recent message ... ,
                "n" : "number of messages
            }
        }

#### Server response
   Returns an array of length n where messages[0] = messages[depth] , messages[n-1] = messages[depth + n - 1])

    
        {
            "status" : "accepted" ,
            "messages" : [{"text" : "hello world" , "origin" : "you"} ,
                     {"text" : "abcd" , "origin" : "target"} ... {}]
        }
    
   origin is the person origin ID, when the origin is the user itself, origin must have the value "you"

#### Errors
   - Invalid target_id
   - Invalid token
   - 'depth' or 'n' value out of bounds.

## 3 - Files
### 3.0 - getFilesList
#### User request

		{
            "token" : "user_token" ,
            "type"  : "getFilesList"
        }
#### Server response
Server must return a list of user files (all)

		{
            "status" : "accepted" ,
            "files" : [{"id" : "file_id" ,"name" : "file_name" , "size" : "size_in_mb" , "age" : age_in_seconds} , ... , {...}]
        }
### 3.1 - getFile
#### User request
		{
            "token" : "user_token" ,
            "type"  : "getFile"
            "params": 
            {
	            "id" : "file_id"
            }
        }
  #### Server Response
Returns a temporary url to download the selected file.
 
		 {
            "status" : "accepted" ,
            "url" : "file_url"
        }
  #### Errors
  - Invalid token
  - Invalid file id
  - User does not have access to this file

### 3.2 sendFile
#### User request
		{
	            "token" : "user_token" ,
	            "type"  : "sendFile" ,
	            params : 
	            {
					"name" : "name of the file"
				}
		}
File will be sent in http POST.
#### Server response
		{
			"status" : "accepted"
		}
#### Errors
- Invalid token
- Invalid file name
-  File is insecure
- File is too big

## 4. Workflows
### 4.1 - getWorkflows
#### User request

	{
		"token" : "toke_id" ,
		"type" : "getWorkflows"
	}

#### Server response

	{
		"status" : "accepted",
		"workflows" : [
			{"name" : "workflow_name" ,"pending" : true ,"id" : "workflow id"} ,
			....
			{...}]
	}
"pending" = true : User has pending work in the workflow.
"pending" = false : User doesn't need to work in the workflow.
#### Errors
- Invalid token

### 4.2 - incrementWorkflow
#### User request

	{
		"token" : "toke_id" ,
		"type" : "incrementWorkflow"
		"params":
		{
			"name" : "file_name"
		}
	}
File will be sent in http POST.
#### Server response

	{
		"status" : "accepted"
	}
#### Errors
- Invalid token
- User doesn't have permission to advance in this workflow.

## 5 - Tasks
### 5.0 - getTasksList
#### User request
	{
		"token" : "token_id" ,
		"type" : "getTasksList"
	}

#### Server response
	{
		"status" : "accepted",
		"tasks" : [{"name" : "task_name" , "id" : "task_id" , "time_left" , "minutes_left" }]
	}

#### Errors
- Invalid token

### 5.1 - getTask
#### User request
	{
		"token" : "token_id" ,
		"type" : "getTask",
		"params" : 
		{
			"id" : "selected task_id"
		}
	}

#### Server response
	{
		"status" : "accepted",
		"start" : "creation_date",
		"end" : "end_date",
		"priority" : ... ,
		"description" : "task_description"
	}

priority is an arbitrary string (urgent , ... )
#### Errors
- Invalid token
- Invalid task ID


### 5.2 - assignTask
#### User request
	{
		"token" : "token_id" ,
		"type" : "assignTask",
		"params" : 
		{
			"name" : "task_name" ,
			"start": "start_date",
			"end":	"end_date",
			"priority" : ...
			"decription" : "task_decription"
			(if team manager) "assignee_id" : "target_id" ,
			(else if normal worker) "assignee_id" : "me"
		}
	}
"me" should be interpreted as sender user ID.
(Team managers are allowed to use "me" in order to assign the task to himself).
#### Server response
	{
		"status" : "accepted"
	}


#### Errors
- Invalid token
- Invalid task parameter
