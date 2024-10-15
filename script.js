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
async function getData(authData){
    
    const athleteResponse = await fetch(`https://www.strava.com/api/v3/athlete?access_token=${authData.access_token}`);
    const athleteData = await athleteResponse.json();

    const statsResponse = await fetch(`https://www.strava.com/api/v3/athletes/${athleteData.id}/stats?access_token=${authData.access_token}`);
    const statsData = await statsResponse.json();
    console.log(statsData)

    const activities = await getActivities(authData);

    return {
        "firstname":athleteData.firstname, 
        "lastname": athleteData.lastname, 
        "img":athleteData.profile, 
        "ytd_runs": statsData.ytd_run_totals.count,
        "ytd_distance": statsData.ytd_run_totals.distance,
        "ytd_time": statsData.ytd_run_totals.moving_time,
        "activities": activities
    }
}
async function getActivities(authData){
    //Strava API paginates its activities results so you must fetch all pages iteratively if there is more than 200 activities
    let page_num = 1;
    let all_activities = [];

    while(true){
        const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${new Date("2024-1-01").getTime() / 1000}&per_page=200&page=${page_num}&access_token=${authData.access_token}`);
        const activities = await response.json();
        all_activities = all_activities.concat(activities);
        page_num += 1;
        if(activities.length == 0){
            break;
        }
    }
    
    return all_activities;
}

async function useData() {
    const authData = await reAuthorize();
    let stravaData = await getData(authData);

    console.log(stravaData.firstname, stravaData.lastname, stravaData.img, stravaData.ytd_runs, stravaData.ytd_distance, stravaData.ytd_time, stravaData.activities)
}

useData();
