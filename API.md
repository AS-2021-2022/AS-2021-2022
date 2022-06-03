#####################################
GENERIC REQUEST STRUCTURE
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

//notes
When "params" field is empty, the server doesn't not need to send it.

GENERIC SERVER RESPONSE
A)
    {
        "status" : "rejected" ,
        "info"   : "error message information" (optional, some requests may not receive this information field)
    }

B)
    {
        "status" : "accepted" ,
        ... (data fields here)
    }

################################################

    list of API calls         (detailed description below ...)

    #login
    1.0 login                       (used to get access token)

    #chat
    2.0 getContactsList             (returns a brief list of user associated contacts)
    2.1 sendMessage                 (send a message to the server)
    2.2 getContactMessages          (returns the current selected contact messages)
    
    #files
    3.0 getFilesList                (returns a brief list of user associated files)
    3.1 getFile                     (when user asks for a file (download))
    3.2 uploadFile                  (when user sends a file)

    #workflows
    4.0 getWorkflows                (returns a brief list of user associated workflows)
    4.1 incrementWorkflow           (when user increments workflow (send file))
    4.2 getWorkflow                 (returns a workflow information)

    #tasks
    5.0 getTasksList                (returns a brief list of tasks)
    5.1 getTask                     (returns selected task information)
    5.2 sendTask                    (user creates a task)


#detailed description of the API calls


1.0. login
    --------------- USER REQUEST -------------------
    {
        "token" : "none" ,
        "type"  : "login",
        "params": 
        {
            "username" : "username",
            "password" : "user password" 
        }
    }
    ---------------- SERVER RESPONSE -----------------
        {
            "status" : "accepted" ,
            "token" : "server_token"  
        }


2.0 getContactsList
    --------------- USER REQUEST -------------------
    {
        "token" : "user_token" ,
        "type"  : "getContactsList"
    }

    ---------------- SERVER RESPONSE -----------------
    {
        "status" : "accepted" ,
        "users": [{"name" : "PESSOA A" , "status" : "user status" , "id" : "PESSOA A id} , ... {...}] ,
        "groups" : [{"name" : "GROUP A" , "id" : "GROUP A id} , ... , {...}]
    }

    //notes
        -> user can have one of these states (online , offline , busy)
        -> ID must be a unique representation which represents a single user / chat group


2.1 sendMessage
    --------------- USER REQUEST -------------------
        {
            "token" : "user_token" ,
            "type"  : "sendMessage",
            "params" :
            {
                "target id" : "id received in 2.0 request" ,
                "message"   : "message written by user"
            }
        }

    ---------------- SERVER RESPONSE (optional) -----------------
    A)
        {
            "status" : "accepted"
        }
    B)
        {
            "status" : "rejected" ,
            "info"   : "..."
        }

        //possible info errors
            -> User / group ID is unknown
            -> User does not have permission to talk with this user / group


2.2 getContactMessages
    --------------- USER REQUEST -------------------
        {
            "token" : "user_token" ,
            "type"  : "getContactMessages",
            "params" :
            {
                "target id" : "id received in 2.0 request" ,
                "depth"   : 0 is the most recent message, 1 -> second most recent message,
                "n" : "number of messages
            }
        }

        ---------------- SERVER RESPONSE  -----------------
    A) (returns an array of length n, messages[0] = messages[depth] , messages[n-1] = messages[depth + n - 1])
        {
            "status" : "accepted" ,
            "messages" : [{"text" : "hello world" , "origin" : "you"} ,
                     {"text" : "abcd" , "origin" : "target"} ... {}]
        }
    //Notes:
        -> origin is the person origin ID, when the origin is the user itself, origin = "you"

    B)
        {
            "status" : "rejected",
            "info"   : "error"
        }
    //Notes:
        -> the server should return an error when the "target_id" is unknown or when user asks for out of bounds messages.
