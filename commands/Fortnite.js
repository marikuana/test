const Fortnite = require("fortnite-api");
const Canvas = require("canvas");
const moment = require("moment");
require("moment-duration-format");

const fortniteAPI = new Fortnite(
    [
        process.env.Email,
        process.env.pass,
        "MzRhMDJjZjhmNDQxNGUyOWIxNTkyMTg3NmRhMzZmOWE6ZGFhZmJjY2M3Mzc3NDUwMzlkZmZlNTNkOTRmYzc2Y2Y",
        "ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ"
    ],
    {
        debug: true
    }
);

const cooldown = new Map();

exports.run = async (client, message, args, level) => {

    await fortniteAPI.login();
    var Stat;
    const msg = await message.channel.send("Search...");
    try{
        Stat = await fortniteAPI.getStatsBR(args.join(" "), "pc", "alltime");
    }catch(e){
        try{
            Stat = await fortniteAPI.getStatsBR(args.join(" "), "ps4", "alltime");
        }catch(e){
            try{
                Stat = await fortniteAPI.getStatsBR(args.join(" "), "xb1", "alltime");
            }catch(e){
                return await msg.edit({embed:{color: 16711680, description: "not found"}});
            }
        }
    }//*/


    var d = new Date().getTime();
    var cd = 1000*60;
    if (cooldown.has(message.author.id)){
        return msg.edit({embed:{color: 16711680, description: `CoolDown ${moment.duration(cd-(d-cooldown.get(message.author.id))).format("H [h], m [m], s [s]")}`}});
    }else{
        cooldown.set(message.author.id, d);
        setTimeout(()=>{
            cooldown.delete(message.author.id);
        },cd);
    }


    message.channel.startTyping();
    await msg.edit("Painting...");

    var title = `${Stat.info.username}  ${Stat.info.platform.toLowerCase()}`;

    const canvas = Canvas.createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    await Canvas.loadImage("./Images/FortniteBK.png").then(i=>{
        ctx.drawImage(i, 0, 0);
    });

    var StartWhile = 40;
    var StCircle = Math.PI/2;

    ctx.fillStyle = `rgba(255, 0, 255, 0.03)`/////// фон
    ctx.fillRect(StartWhile, StartWhile, canvas.width-StartWhile, canvas.height-StartWhile);///////

    ctx.font = "bold 92px serif";////властивісті тексту
    var t = ctx.measureText(title);////////////////////

    ctx.fillStyle = "rgba(0, 128, 255, 0.3)";;//Місце для текску
    ctx.fillRect(StartWhile, StartWhile, t.width+StartWhile, 110);//////////////////////

    ctx.fillStyle = "rgb(255, 255, 255)";//
    //ctx.font = "bold 48px serif";/////////Текст
    ctx.fillText(title, 45, 120);///////////////




    Stat.group.all = Stat.lifetimeStats;

    var Y = 180;//180 //400
    Stat.group.solo.color = "rgb(0,212,255)";
    Stat.group.duo.color = "rgb(255,128,0)";
    Stat.group.squad.color = "rgb(128,0,255)"; 
    Stat.group.all.color = "rgb(145, 164, 185)";
    for (let k in Stat.group){

        f1(StartWhile, Y);
        f2(StartWhile, Y+60);

        ctx.font = "bold 30px serif";
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.strokeStyle = Stat.group[k].color;

        fillStroke("WIN", StartWhile+60, Y+200);
        fillStroke("K/D", StartWhile+290, Y+200);
        fillStroke("KILLS", StartWhile+520, Y+200);
        fillStroke("MATCHES", StartWhile+750, Y+200);
        fillStroke("Kill/Min", StartWhile+1010, Y+200);
        fillStroke("Kill/Match", StartWhile+1260, Y+200);

        ctx.font = "bold 48px serif";
        ctx.fillStyle = Stat.group[k].color;
        ctx.strokeStyle = "rgb(0, 0, 0)";
        fillStrokeS(Stat.group[k].wins, StartWhile+100, Y+130);
        fillStrokeS(Stat.group[k]["k/d"], StartWhile+320, Y+130);
        fillStrokeS(Stat.group[k].kills, StartWhile+570, Y+130);
        fillStrokeS(Stat.group[k].matches, StartWhile+830, Y+130);
        fillStrokeS(Stat.group[k].killsPerMin, StartWhile+1070, Y+130);
        fillStrokeS(Stat.group[k].killsPerMatch, StartWhile+1330, Y+130);//*/

        ctx.font = "bold 47px serif";
        f3(StartWhile, Y, Stat.group[k].color);
        ctx.fillStyle = "rgb(255, 255, 255)"
        ctx.fillText(k.toUpperCase(), StartWhile+10, Y+45);
        ctx.fillText("Score: "+Stat.group[k].score, 1100, Y+45);

        ctx.fillStyle = "rgba(0, 128, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(1600, Y+135, 80, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = Stat.group[k].color;
        for (let i = 0; i<80;i++){
            ctx.beginPath();
            ctx.arc(1600, Y+135, i, 0-StCircle, (Math.PI/50*Stat.group[k]["win%"])-StCircle);
            ctx.stroke();
        }

        ctx.font = "bold 40px serif";
        ctx.fillStyle = "rgb(255, 255, 255)";
        var text = ctx.measureText(Stat.group[k]["win%"]+"%");
        ctx.fillText(Stat.group[k]["win%"]+"%", 1605-text.width/2, Y+140);
        ctx.font = "34px serif";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("win%", 1560, Y+190);

        Y+=220;
    }

    
   ctx.font = "bold 24px serif";

   ctx.fillStyle = "rgb(255, 255, 255)"
   //ctx.fillText(`Design by \n${client.users.get("344478376482045955").tag || "ЕГОР!!!#3508"}`, 1670, 1040);

   

    await message.channel.send({files:[{
        attachment: canvas.toBuffer(),
        name: 'file.jpg'
    }]});
    message.channel.stopTyping();
    msg.delete();
    //console.log(Stat);

    function f1(x,y){
        var x1 = x+1740,
        y1 = y+60;
        ctx.fillStyle = "rgba(84,127,168, 0.8)"//"rgba(0, 128, 255, 0.6)";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y);
        ctx.lineTo(x, y1);
        ctx.moveTo(x+1460, y1);
        ctx.lineTo(x, y1);
        ctx.lineTo(x1, y);
        ctx.fill();

    }
    function f2(x,y){
        var x1 = x+1460,
        y1 = y+160;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y);
        ctx.lineTo(x, y1);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y);
        ctx.lineTo(x, y1);
        ctx.fill();
    }
    function f3(x, y, color){
        var x1 = x+200,
        y1 = y+60;
        ctx.fillStyle = color
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y);
        ctx.lineTo(x, y1);
        ctx.moveTo(x+230, y1);
        ctx.lineTo(x, y1);
        ctx.lineTo(x1, y);
        ctx.fill();
    }
    function fillStroke(text, x, y){
        ctx.fillText(text, x, y);
        ctx.strokeText(text, x, y);
    }
    function fillStrokeS(text, x, y){
        var t = ctx.measureText(text);
        ctx.fillText(text, x-t.width/2, y);
        ctx.strokeText(text, x-t.width/2, y);
    }
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["ftn"],
    permLevel: 0,
    coolDown: 10
  };

exports.help = {
    name: "fortnite",
    category: "Game",
    description: "Stat account Fornite",
    usage: "ftn [userName]"
}
