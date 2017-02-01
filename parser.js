
const https = require('https');
let cheerio = require('cheerio');
const db = require('./models/db');

var fs = require('fs');
var path = require('path');

function getParams(){
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return JSON.stringify({day: day, time: hours, minute: minutes, month: month, year: year, onlyFavorites: "N"});
}

function getProgramming(){
    var post_options = {
        host: 'www.directv.com.uy',
        port: '443',
        path: '/guia/Services/ProgrammingGuideAjax.asmx/GetProgramming',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
            'Content-Type': 'application/json; charset=UTF-8',
            'Referer': 'https://www.directv.com.uy/guia/guia.aspx?type=&link=nav'
        }
    };

    // Set up the request
    var req = https.request(post_options, function(res) {
                var response = '';
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    response += chunk;
                    console.log(chunk);
                });
                res.on('end', function () {
                    parseProgramming(response);
                });
            });
    console.log('Using params: ');
    var pars = getParams();
    console.log(pars)
    req.write(pars);
    req.end();
}

function parseProgramming(response){
    var r = JSON.parse(response);
    //console.log(r);
    let $ = cheerio.load(r.d);
    var lines = $('ul');
    var counter = lines.length;

    lines.each((i, item) =>{
        var block = $($(item).find('li')[0]);
        var title = block.attr('title') || block.text();
        var channelNumber = block.attr('channel');
        
        var query = { 'number': channelNumber };
        update = { expire: new Date() };
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

        db.Channel.findOneAndUpdate(query, update, options, function(error, result) {
            if (error) {
                counter--;
                return;
            }
            result.current = title;
            result.save().then(()=>{counter--; console.log( channelNumber + ' - ' + title)});
        });

        //console.log(`${block.attr('channel')} - ${title}`);
    });

    setInterval(()=>{ 
        if(counter == 0){
            process.exit();
        }
    },1000);
}

function getChannels(){
    var filePath = path.join(__dirname, 'channels.txt');

    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (!err){
            parseChannels(data);
        }else{
            console.log(err);
        }
    });
}

function parseChannels(response){
    let $ = cheerio.load(response);
    var lines = $('li');
    var counter = lines.length;    
    lines.each((i, item) =>{
        var block = $(item);
        var channelNumber = block.attr('id');
        var channelName = block.attr('name');
        
        var query = { 'number': channelNumber };
        update = { expire: new Date() };
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

        db.Channel.findOneAndUpdate(query, update, options, function(error, result) {
            if (error){
                counter--;
                return;
            } 
            result.name = channelName;
            result.save().then(()=>{counter--; console.log( channelNumber + ' - ' + channelName)});
        });
    })

    setInterval(()=>{ 
        if(counter == 0){
            process.exit();
        }
    },1000);
}

if(process.argv.length != 3){
    console.log('Invalid parameters. Valid parameters: -p (parse programming) OR -c (parse channels)');
    process.exit();
}
if(process.argv[2] == '-p'){
    getProgramming();
}else if(process.argv[2] == '-c'){
    getChannels();
}
else{
    console.log('Invalid parameters. Valid parameters: -p (parse programming) OR -c (parse channels)');
    process.exit();
}