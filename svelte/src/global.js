export async function callAPI(dict)
{
        const res = await fetch('https://localhost:5000' , {
            method: 'POST',
            body : JSON.stringify(dict) 
        });

        return await res.json();
}