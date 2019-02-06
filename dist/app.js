const readlineSync = require('readline-sync');
const got = require('got');
const tough = require('tough-cookie');
const fs = require('fs');
const converter = require('json-2-csv')

const domain = 'http://hubs.hust.edu.cn'
const postUrl = '/aam/score/CourseInquiry_ido.action'

console.log('1. Login');
console.log('2. Copy below code into your browser and press Enter');
console.log(`javascript:alert(document.cookie.split('; ')[1])`)

const sessionCookie = readlineSync.question('Paste Here:\n');

const query = new URLSearchParams([['start', '2019-02-01'], ['end', '2019-08-01']]);
let cookieJar = new tough.CookieJar();
cookieJar.setCookie(sessionCookie, domain, () => { });

// JSESSIONID = 00003jGRbumRGeZXE4 -4_Znpzng: 166nac9ai
console.log('Downloading...');
got.post(`${domain}${postUrl}`, { query, cookieJar })
    .then(res => {
        let eventSet = new Set();
        JSON.parse(res.body).forEach(o => {
            eventSet.add(JSON.stringify(o));
        });
        let events = Array.from(eventSet).map(o => JSON.parse(o));
        fs.writeFileSync('./output.json', JSON.stringify(events));
        console.log('Download Sucessfully!');

        const outputRaw = require('../output.json');
        converter.json2csvAsync(format(outputRaw))
            .then(data => {
                console.log('Convert it to CSV...');
                fs.writeFileSync('./output.csv', data)
                console.log('Convert Successfully!');
            })

    });




function fillZero(v) {
    if (v - 10 < 0) { v = '0' + v; } return v;
}
function f24t12(str) {
    str = str.replace(new RegExp('-', 'g'), '/');
    let isPM = false;
    let [hour, minute] = str.split(':');
    hour = (hour > 12) ? (isPM = true, (hour - 12)) : (hour - 0);
    let suffix = (isPM) ? 'PM' : 'AM';
    return `${fillZero(hour)}:${minute} ${suffix}`;
}
function format(outputRaw) {
    return outputRaw.map(o => {
        const [date, startTime] = o.start.split(' ');
        const d = date.split('-');
        const [, endTime] = o.end.split(' ');
        const txt = JSON.parse(o.txt.replace(new RegExp(`'`, 'g'), `"`));
        const location = txt.JSMC;
        const description = `@${txt.JGXM} #${txt.KTMC}`
        return {
            Subject: o.title,
            'Start Date': `${d[1]}/${d[2]}/${d[0]}`,
            'Start Time': f24t12(startTime),
            'End Date': `${d[1]}/${d[2]}/${d[0]}`,
            'End Time': f24t12(endTime),
            Location: location,
            Description: description
        }
    })
}