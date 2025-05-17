const { parse } = require('csv-parse')
const fs = require('fs'); 
const path = require('path');
const { stringify } = require('csv-stringify/sync');

const getCSVData = async () => {
    return new Promise((resolve, reject) => {
        const data = [];
        const filePath = path.join(__dirname, "../dataset/top_websites.csv");
        fs.createReadStream(filePath)
        .pipe(parse({ delimiter: ','}))
        .on('data', (rows) => {
            let schema = "https://";
            if(rows[0] == 214) {
                data.push(schema + rows[1]);
            }
        })
        .on('end', () => {
            resolve(data);
        })
        .on('error', (err) => {
            reject(err);
        });
    });
}

const writeToCSV = (records) => { 
    const filePath = path.join(__dirname, "../output/durations_v2.csv");
    const output = stringify(records, { header: true });
    fs.appendFileSync(filePath, output);
}

module.exports = {
    getCSVData,
    writeToCSV
}