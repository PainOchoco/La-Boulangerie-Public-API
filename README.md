# La-Boulangerie-Public-API
A rest API written in Node JS with Express for my Minecraft Server **mc.laboulangerie.net** and for my Raspberry Pi's status.

## 📌 Endpoints
There are 2 routes: "stats" and "minecraft"

- /stats/breadberry
```javascript
{
  "cpuLoad":  //[Integer] CPU Load percentage
  "cpuTemp"   //[Integer] CPU temperature in °C
  "ramUsage": //[Integer] RAM usage percentage
  "latency":  //[Integer] Internet latency in ms
  
}
```
- /minecraft/player/<username>
```javascript
{
  "uuid":          //[String] User's Mojang UUID
  "username":      //[String] It's written ok
  "online":        //[Boolean] If the player is on the Minecraft server
  "skinRenderURL": //[String] URL to a Minecraft Skin render using visage.surgeplay.com
  "groups":        // [Array] Player's groups
  "town":          //[String] Town the player is in
  "townRank":      //[String] Player's rank in his town
  "nationRank":    //[String] Player's rank in his nation
  "friends":       //[Array] Player's friends
  "lastOnline":    //[Integer] Timestamp 
}
```
- /minecraft/town/<name>
```javascript
{
  "residents":  //[Array]
  "mayor":      //[String]
  "nation":     //[String]
  "assistants": //[Array]
  "townBoard":  //[String]
  "isOpen":     //[Boolean]
  "tag":        //[String]
  "registered": //[Integer] Timestamp
}
```
- /minecraft/nation/<name>
```javascript
{
"towns":      //[Array]
"capital":    //[String]
"assistants": //[Array]
"isOpen":     //[Boolean]
"tag":        //[String]
"registered": //[Integer] Timestamp
}
```

- /minecraft/players
List of object of every player on the server
```javascript
[
  {
    "uuid":     //[Integer]
    "username": //[String]
  },
  ...
]
```
- /minecraft/towns
Array of every towns names

- /minecraft/nations
Array of every nations names

## ⚖ License 
[MIT License](https://github.com/PainOchoco/La-Boulangerie-Public-API/blob/master/LICENSE)
