var csvWriter = require('csv-write-stream')
var fs = require('fs');

var writer = csvWriter()

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    var ping = require('ping');

    var hosts = ['google.com', 'yahoo.com', 'testapialumnos.caen.edu.pe'];

    let verifyPing = []
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
    var rangepivot = null;
    while (true) {
        let time = (new Date);
        writer = csvWriter({sendHeaders: false})
        writerdisconnects = csvWriter({sendHeaders: false})
        writer.pipe(fs.createWriteStream(`network_${time.toISOString().split('T')[0].replaceAll("-","_")}.csv`, { flags: 'a' }));
        writerdisconnects.pipe(fs.createWriteStream(`disconnects_${time.toISOString().split('T')[0].replaceAll("-","_")}.csv`, { flags: 'a' }));
        
        for (let host of hosts) {
            console.log(time)
            let res = await ping.promise.probe(host, { timeout:  5});

            let data = { time:time.toISOString().split('.')[0].replace("T"," "),hour: time.getHours(), minute: time.getMinutes(), seconds: time.getSeconds(), host: host, delay: res.time };
            writer.write(data);

            verifyPing.push(data)
        }
        let filterPing = verifyPing.filter(el => {
            if (typeof el.delay == "number") {
                return el
            }
        })
        if (filterPing.length > 0) {
            console.log(typeof rangepivot);
            if(Array.isArray(rangepivot)){
                rangepivot[1]=Object.assign({}, time)
                writerdisconnects.write(rangepivot)
                rangepivot=null

            }

            console.log('Si hay ping');
        }
        if (filterPing.length == 0) {
            console.log('No hay ping');
            if(rangepivot==null){ 
                rangepivot = [Object.assign({}, time)]
                
            }



        }
        writer.end();
        writerdisconnects.end();
        await sleep(1000);
    
        
    }
}

run();