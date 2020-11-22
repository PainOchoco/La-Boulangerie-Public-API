# 🥖 La Boulangerie Public API
A rest API written in Node JS with Express for my Minecraft Server **mc.laboulangerie.net** and for my Raspberry Pi's status.

It's running on http://api.laboulangerie.net:4242.

## 📌 Endpoints
There are 2 main routes: "stats" and "minecraft"

- /stats/breadberry<br/>
```javascript
{
  "cpuLoad":  // [Integer] CPU Load percentage
  "cpuTemp"   // [Integer] CPU temperature in °C
  "ramUsage": // [Integer] RAM usage percentage
  "latency":  // [Integer] Internet latency in ms
  
}
```
- /minecraft/player/<username><br/>
```javascript
{
  "uuid":          // [String] 
  "username":      // [String] 
  "online":        // [Boolean] If the player is on the Minecraft server
  "skinRenderURL": // [String]  URL to a Minecraft Skin render using visage.surgeplay.com
  "groups":        // [Array]
  "town":          // [String]
  "townRank":      // [String] 
  "nationRank":    // [String] 
  "friends":       // [Array]
  "lastOnline":    // [Integer]
  "money":         // [Integer]
  "isAfk":         // [Boolean] 
  "logoutLocation":// [Object]
    "x":           // [Integer]
    "y":           // [Integer]
    "z":           // [Integer] 
  "nickame":       // [String]
}
```
- /minecraft/town/<name><br/>
```javascript
{
  "name":       // [Array]
  "residents":  // [Array]
  "mayor":      // [String]
  "nation":     // [String]
  "assistants": // [Array]
  "townBoard":  // [String]
  "isOpen":     // [Boolean]
  "tag":        // [String]
  "registered": // [Integer]
}
```
- /minecraft/nation/<name><br/>
```javascript
{
"name":       // [String]
"king":       // [String]
"towns":      // [Array]
"capital":    // [String]
"assistants": // [Array]
"residents":  // [Array]
"isOpen":     // [Boolean]
"tag":        // [String]
"registered": // [Integer] Timestamp
"color":      // [Hex color code]
}
```

- /minecraft/players<br/>
List of object of every player on the server
```javascript
[
  {
    "uuid":     // [Integer]
    "username": // [String]
  },
  ...
]
```
- /minecraft/towns<br/>
Array of every towns names

- /minecraft/nations<br/>
Array of every nations names

## ⚖ License 
[MIT License](https://github.com/PainOchoco/La-Boulangerie-Public-API/blob/master/LICENSE)
