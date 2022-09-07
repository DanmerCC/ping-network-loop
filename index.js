var csvWriter = require('csv-write-stream')
var fs = require('fs');

var writer = csvWriter()

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    var ping = require('ping');

    var hosts = ['google.com', 'yahoo.com'];

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
    while (true) {
        let time = (new Date);
        writer = csvWriter({sendHeaders: false})
        writer.pipe(fs.createWriteStream(`network_${time.toISOString().split('T')[0].replaceAll("-","_")}.csv`, { flags: 'a' }));
        
        for (let host of hosts) {
            console.log(time)
            let res = await ping.promise.probe(host);
            
            let data = { time:time.toISOString().split('.')[0].replace("T"," "),hour: time.getHours(), minute: time.getMinutes(), seconds: time.getSeconds(), host: host, delay: res.time };
            writer.write(data);
        }
        writer.end();
        await sleep(1000);
    
        
    }
}

run();