const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const fs = require('fs');
const moment = require('moment');
const chalk = require('chalk');
require('./util/eventLoader')(client);
var prefix = ayarlar.prefix;
const { Player } = require("discord-music-player");
const player = new Player(client, {
  timeout: 5,
  volume: 200,
  quality: 'high',
});
client.player = player;

const AutoPoster = require('topgg-autoposter')

const ap = AutoPoster('', client)

ap.on('posted', () => {
  console.log('Posted stats to Top.gg!')
})

const log = message => {
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
  };

 client.commands = new Discord.Collection();
 client.aliases = new Discord.Collection();
 fs.readdir('./komutlar/', (err, files) => {
   if (err) console.error(err);
   log(`${files.length} komut yüklenecek.`);
   files.forEach(f => {
     let props = require(`./komutlar/${f}`);
     log(`Yüklenen komut: ${props.help.name}.`);
     client.commands.set(props.help.name, props);
     props.conf.aliases.forEach(alias => {
       client.aliases.set(alias, props.help.name);
     });
   });
 });

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
    return new Promise((resolve, reject) => {
      try {
        let cmd = require(`./komutlar/${command}`);
        client.commands.set(command, cmd);
        cmd.conf.aliases.forEach(alias => {
          client.aliases.set(alias, cmd.help.name);
        });
        resolve();
      } catch (e){
        reject(e);
      }
    });
  };
  
  client.unload = command => {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(`./komutlar/${command}`)];
        let cmd = require(`./komutlar/${command}`);
        client.commands.delete(command);
        client.aliases.forEach((cmd, alias) => {
          if (cmd === command) client.aliases.delete(alias);
        });
        resolve();
      } catch (e){
        reject(e);
      }
    });
  };

/////////////bot-dm////////////////

client.on("message", msg => {
  var dm = client.channels.cache.get("")
  if(msg.channel.type === "dm") {
  if(msg.author.id === client.user.id) return;
  const botdm = new Discord.MessageEmbed()
  .setTitle(`${client.user.username} Dm`)
  .setTimestamp()
  .setColor("BLUE")
  .setThumbnail(`${msg.author.avatarURL()}`)
  .addField("sender", msg.author.tag)
  .addField("sender ID", msg.author.id)
  .addField("message", msg.content)
  
  dm.send(botdm)
  
  }
  if(msg.channel.bot) return;
  });

///////////////////////////////////

client.player
    .on('playlistAdd',  (message, queue, playlist) => 
        message.channel.send(new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setDescription(`${playlist.name} playlist with ${playlist.videoCount} songs has been added to the queue!`))
        );

/////////////////////////////////

client.login(ayarlar.token);


