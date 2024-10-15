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

function calculateStats(activities){
    //filter out activities that are not runs
    const filteredActivities = activities.filter((activity) => activity.type == 'Run')
    
    const activitiesSortedByDist = filteredActivities.sort((a, b) => b.distance - a.distance)
    console.log(activitiesSortedByDist.slice(0,3)) 
    
    const activitiesSortedBySpeed = filteredActivities.sort((a, b) => b.average_speed - a.average_speed)
    console.log(activitiesSortedBySpeed.slice(0,3)) 

    return {
        "weekly_avg_runs": 0,
        "weekly_avg_distance": 0,
        "weekly_avg_time": 0,
        "longest_runs": activitiesSortedByDist.slice(0,3),
        "fastest_runs": activitiesSortedBySpeed.slice(0,3),
    }
}

async function useData() {
    const authData = await reAuthorize();
    let stravaData = await getData(authData);

    let newStravaStats = calculateStats(stravaData.activities);


    const profile_name = document.getElementById('profile-name');
    profile_name.innerHTML = stravaData.firstname + ' ' + stravaData.lastname;

    const profile_img = document.getElementById('profile-img');
    profile_img.src = 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/42701890/33419624/1/large.jpg'

    const ytd_runs_elem = document.getElementById('year-runs');
    ytd_runs_elem.innerHTML = stravaData.ytd_runs;

    const ytd_distance_elem = document.getElementById('year-distance');
    ytd_distance_elem.innerHTML = Math.round(stravaData.ytd_distance/1000) + 'km';

    const ytd_time_elem = document.getElementById('year-time');
    ytd_time_elem.innerHTML = Math.floor(stravaData.ytd_time/60/60) + 'h ' + Math.floor(stravaData.ytd_time/60%1) + 'm';
    
    const weekly_runs_elem = document.getElementById('weekly-runs');
    weekly_runs_elem.innerHTML = newStravaStats.weekly_avg_runs;
    const weekly_distance_elem = document.getElementById('weekly-distance');
    weekly_distance_elem.innerHTML = Math.round(newStravaStats.weekly_avg_distance/1000);
    const weekly_time_elem = document.getElementById('weekly-time');
    weekly_time_elem.innerHTML = Math.floor(newStravaStats.weekly_avg_time/60/60) + 'h ' + Math.floor(newStravaStats.weekly_avg_time/60%1) + 'm';
}

useData();
