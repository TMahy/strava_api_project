import {config} from './config.js';

const client_id = config.client_id;
const client_secret = config.client_secret;
const refresh_token = config.refresh_token;
const auth_link = 'https://www.strava.com/oauth/token';

console.log(client_id)

async function reAuthorize(){
    try{
        const response = await fetch(auth_link,{
            method: 'post', 
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },    
            body: JSON.stringify({
                client_id: client_id,
                client_secret: client_secret,
                refresh_token: refresh_token,
                grant_type: 'refresh_token'
            })    
        })
    const authData = await response.json();
    return authData;
    }
    catch(e){
        console.log(e)
    }
}
