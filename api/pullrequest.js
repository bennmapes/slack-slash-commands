import { Router } from 'express';
import seedrandom from 'seedrandom';
import moment from 'moment';

const router = Router();

const daysEnum = {
    MONDAY:  "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday"
}
const all = Object.values(daysEnum);
const people = [
    {
        name: "Doug",
        dayBlacklist: []
    },
    {
        name: "Tom",
    },
    {
        name: "Hardeep",
        dayBlacklist: [daysEnum.TUESDAY]
    },
    {
        name: "Benn",
        dayBlacklist: []
    },
    {
        name: "Everet",
    },
    {
        name: "Jason",
        dayBlacklist: all,
    },
]

router.get('/', function(req, res) {
    // const data = getPayLoad(req);
    const output = getPullRequestMasters();
    const response = {
        "response_type": "in_channel",
        "text": "Pull Request Masters for the week",
        "attachments": output.map(item => {
            return {
                "text": item
            }
        })
    };
    res.send(response);
});

router.post('/', function(req, res) {
    const output = getPullRequestMasters();
    const response = {
        "response_type": "in_channel",
        "text": "Pull Request Masters for the week",
        "attachments": output.map(item => {
            return {
                "text": item
            }
        })
    };
    res.send(response);
});

/*
    The following data is available (see https://api.slack.com/slash-commands)
    token, team_id, team_domain, channel_id, channel_name, user_id, user_name,
    command, text, response_url
*/
const getPayLoad = req => {
    return req.method === 'GET' ? req.query : req.body;
}

const getPullRequestMasters = () => {
    let remainingPeople = [...people];
    let days = Object.values(daysEnum);
    let creation_attempt=0;

    return pickPeople(0, days, remainingPeople, creation_attempt, []);

}


// Recursivly Picks people for each day in the "days" array starting with the given day index.
const pickPeople = (day_index, days, remainingPeople, creation_attempt, output) => {
    // Make sure we have people to choose from
    if(people.length <= 0) {
        console.error("Cannot assign people to days without a list of people");
    }
    // If we ran out of people and haven't fille up the days, reuse the people 
    else if(remainingPeople.length <= 0) {
        remainingPeople = [...people];
    }
    // If we've finished assigning all the days we outta here!
    if(day_index >= days.length) {
        return output;
    }
    const random = genRandomSeed(day_index, creation_attempt);
    let person_index = Math.floor(random*remainingPeople.length);
    // Make sure the person chosen does not have the current day blacklisted
    if(remainingPeople[person_index].dayBlacklist && remainingPeople[person_index].dayBlacklist.includes(days[day_index])) {
        //  If we've tried a bunch of times to fill this day and it hasn't worked, restart the whole process.
        if(creation_attempt >= 50) {
            remainingPeople = [...people];
            output = [];
            creation_attempt = 0;
            return pickPeople(0, days, remainingPeople, creation_attempt, output);
        } else {
            // Try and pick another person for this day.
            creation_attempt++;
            return pickPeople(day_index, days, remainingPeople, creation_attempt, output);
        }
        
    } else {
        // Add the chosed person for this day to our output
        output.push(`${remainingPeople[person_index].name} has been chosen for ${days[day_index]}`);
        // Remove that person from the list of people
        remainingPeople.splice(person_index, 1);
        // Pick someone for the next day
        return pickPeople(++day_index, days, remainingPeople, creation_attempt, output);
    }
}

const genRandomSeed = (day_index, creation_attempt) => {
    // Randomly generate an index for the remaining people array.
    const date = moment().startOf('isoWeek');
    const milis = date.toDate().getTime()
    const seed = Math.floor(milis/2)*(day_index+1)+creation_attempt;
    const random = seedrandom(seed)();
    return random;
}
 module.exports = router;