const outputRaw = require('../output.json');
const converter = require('json-2-csv')
const fs = require('fs');

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

const outputMod = format(outputRaw);
console.log(outputMod[3])

converter.json2csvAsync(outputMod)
    .then(data => {
        fs.writeFileSync('./output.csv', data)
    })