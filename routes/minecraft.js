const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const minecraftPlayer = require("minecraft-player");
const mysql = require("mysql");
const moment = require("moment");
const statusAPI = "https://mcapi.us/server/query?ip=mc.laboulangerie.net";
const { host, user, pass, base } = require("../envs");

const connection = mysql.createConnection({
  host: host,
  user: user,
  password: pass,
  database: base,
});

connection.connect();

// * Fetch informations
router.get("/players", (req, res) => {
  function getPlayers() {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT uuid,username FROM luckperms_players",
        (error, results, fields) => {
          if (error) return reject(error);
          let players = [];
          results.forEach((result) => {
            players.push({
              uuid: result.uuid,
              username: result.username,
            });
          });
          resolve(players);
        }
      );
    });
  }
  getPlayers().then((data) => {
    res.json(data);
  });
});
router.get("/towns", (req, res) => {
  function getTowns() {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT name FROM TOWNY_TOWNS",
        (error, results, fields) => {
          if (error) return reject(error);
          console.log(results);
          let towns = [];
          results.forEach((result) => {
            towns.push(result.name);
          });
          resolve(towns);
        }
      );
    });
  }
  getTowns().then((data) => {
    res.json(data);
  });
});
router.get("/nations", (req, res) => {
  function getNations() {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT name FROM TOWNY_NATIONS",
        (error, results, fields) => {
          if (error) return reject(error);
          console.log(results);
          let nations = [];
          results.forEach((result) => {
            nations.push(result.name);
          });
          resolve(nations);
        }
      );
    });
  }
  getNations().then((data) => {
    res.json(data);
  });
});

router.get("/town/:name", (req, res) => {
  let townName = req.params.name;

  function getData(townName) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM TOWNY_TOWNS WHERE name = '${townName}'`,
        (error, results, fields) => {
          if (error) return reject(error);
          let dataPacket = results[0];
          let residents = dataPacket.residents.split("#");
          let mayor = dataPacket.mayor;
          let nation = dataPacket.nation ? dataPacket.nation : "none";
          let assistants = dataPacket.assistants
            ? dataPacket.assistants.split("#")
            : "none";
          let townBoard;
          if (dataPacket.townBoard == "/town set board [msg]") {
            townBoard = "none";
          } else {
            townBoard = dataPacket.townBoard;
          }
          let isOpen;
          if ((dataPacket.open = "1")) {
            isOpen = true;
          } else {
            isOpen = false;
          }
          let tag = dataPacket.tag ? dataPacket.tag : "none";
          let registered = dataPacket.registered;

          resolve({
            residents,
            mayor,
            nation,
            assistants,
            townBoard,
            isOpen,
            tag,
            registered,
          });
        }
      );
    });
  }

  getData(townName)
    .then((data) => {
      res.json(data[0]);
    })
    .catch((err) => console.error(err));
});

router.get("/nation/:name", (req, res) => {
  let nationName = req.params.name;

  function getData(nationName) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM TOWNY_NATIONS WHERE name = '${nationName}'`,
        (error, results, fields) => {
          if (error) return reject(error);
          let dataPacket = results[0];
          let towns = dataPacket.towns.split("#");
          let capital = dataPacket.capital;
          let assistants = dataPacket.assistants
            ? dataPacket.assistants.split("#")
            : "none";
          let nationBoard;
          if (dataPacket.nationBoard == "/town set board [msg]") {
            townBoard = "none";
          } else {
            townBoard = dataPacket.townBoard;
          }
          let isOpen;
          if ((dataPacket.open = "1")) {
            isOpen = true;
          } else {
            isOpen = false;
          }
          let tag = dataPacket.tag ? dataPacket.tag : "none";
          let registered = dataPacket.registered;

          resolve({
            towns,
            capital,
            assistants,
            nationBoard,
            isOpen,
            tag,
            registered,
          });
        }
      );
    });
  }

  getData(nationName)
    .then((data) => {
      res.json(data[0]);
    })
    .catch((err) => console.error(err));
});

router.get("/player/:id", async (req, res) => {
  let playerName = req.params.id;
  let { uuid } = await minecraftPlayer(playerName);
  let { username } = await minecraftPlayer(playerName);
  let cleanUUID = uuid.replace(/-/g, "");
  let onlinePlayersList = await fetch(statusAPI)
    .then((res) => res.json())
    .then((json) => json.players.list);

  let isOnline = onlinePlayersList
    ? onlinePlayersList.includes(username)
    : false;

  function getGroups(uuid) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM luckperms_user_permissions WHERE uuid = '${uuid}'`,
        (error, results, fields) => {
          if (error) return reject(error);
          let groups = [];
          results.forEach((result) => {
            groups.push(result.permission);
          });
          resolve(groups);
        }
      );
    });
  }

  function getCity(username) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM TOWNY_RESIDENTS WHERE name = '${username}'`,
        (error, results, fields) => {
          let dataPacket = results[0];
          if (error) return reject(error);
          let town = dataPacket.town ? dataPacket.town : "none";
          let townRank = dataPacket["town-ranks"]
            ? dataPacket["town-ranks"]
            : "none";
          let nationRank = dataPacket["nation-ranks"]
            ? dataPacket["nation-ranks"]
            : "none";
          let friends = dataPacket.friends
            ? dataPacket.friends.split("#")
            : "none";

          let lastOnline = dataPacket.lastOnline;
          resolve({ town, townRank, nationRank, friends, lastOnline });
        }
      );
    });
  }

  Promise.all([getGroups(uuid), getCity(username)])
    .then((data) =>
      res.json({
        uuid: uuid,
        username: username,
        online: isOnline,
        skinRenderURL:
          "https://visage.surgeplay.com/bust/512/" + cleanUUID + ".png",
        groups: data[0],
        town: data[1].town,
        townRank: data[1].townRank,
        nationRank: data[1].nationRank,
        friends: data[1].friends,
        lastOnline: data[1].lastOnline,
      })
    )
    .catch((err) => console.error(err));
});

module.exports = router;
