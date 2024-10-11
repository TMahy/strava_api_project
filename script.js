import {config} from './config.js';

const client_id = config.client_id;
const client_secret = config.client_secret;
const refresh_token = config.refresh_token;
const auth_link = 'https://www.strava.com/oauth/token';

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

// Data needed to retrive or calculate from API data
// Profile information if possible -> Image and Name
async function getProfile(){
    const response = await fetch(``);
    const profileData = await response.json();
    console.log(profileData);
}
//  Total runs this year, Total distance this year, Total time this year
async function getTotals(){
    const response = await fetch(``)
    
}
//  Weekly averages -> runs, distance, time
async function getWeekly(){

}
// Top 3 longest runs -> Not sure there is an end point so will have to calculate
// Top 3 fastest runs -> "---"
async function getAllActivities(){

}

