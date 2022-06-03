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
    5.2 sendTask                    (user creates a task)


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
        
   B)
    
        {
            "status" : "rejected" ,
            "info"   : "..."
        }

   possible info errors:
            -> User / group ID is unknown
            -> User does not have permission to talk with this user / group


### 2.2 getContactMessages
 #### User request
        {
            "token" : "user_token" ,
            "type"  : "getContactMessages",
            "params" :
            {
                "target id" : "id received in 2.0 request" ,
                "depth"   : 0 is the most recent message, 1 -> second most recent message ... ,
                "n" : "number of messages
            }
        }

#### Server response
   Returns an array of length n where messages[0] = messages[depth] , messages[n-1] = messages[depth + n - 1])
    A)
    
        {
            "status" : "accepted" ,
            "messages" : [{"text" : "hello world" , "origin" : "you"} ,
                     {"text" : "abcd" , "origin" : "target"} ... {}]
        }
    
   origin is the person origin ID, when the origin is the user itself, origin must have the value "you"

  B)
  
        {
            "status" : "rejected",
            "info"   : "error"
        }
   The server should return an error when the "target_id" is unknown or when user asks for out of bounds messages.