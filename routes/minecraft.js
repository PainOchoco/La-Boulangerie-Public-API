const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const minecraftPlayer = require("minecraft-player");
const mysql = require("mysql");
const ftp = require("basic-ftp");
const yaml = require("js-yaml");
const fs = require("fs");
const statusAPI = "https://mcapi.us/server/query?ip=mc.laboulangerie.net";
const {
  SQLhost,
  SQLuser,
  SQLpass,
  SQLbase,
  FTPhost,
  FTPuser,
  FTPpass,
} = require("../envs");

const SQLconnection = mysql.createPool({
  host: SQLhost,
  user: SQLuser,
  password: SQLpass,
  database: SQLbase,
});

// * Fetch informations

router.get("/players", (req, res) => {
  function getPlayers() {
    return new Promise((resolve, reject) => {
      SQLconnection.getConnection((err, connection) => {
        connection.query(
          "SELECT uuid,username FROM luckperms_players",
          (error, results, fields) => {
            if (error) return reject(error);
            connection.release();
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
    });
  }
  getPlayers().then((data) => {
    res.json(data);
  });
});
router.get("/towns", (req, res) => {
  function getTowns() {
    return new Promise((resolve, reject) => {
      SQLconnection.getConnection((err, connection) => {
        connection.query(
          "SELECT name FROM TOWNY_TOWNS",
          (error, results, fields) => {
            if (error) return reject(error);
            connection.release();
            let towns = [];
            results.forEach((result) => {
              towns.push(result.name);
            });
            resolve(towns);
          }
        );
      });
    });
  }
  getTowns().then((data) => {
    res.json(data);
  });
});
router.get("/nations", (req, res) => {
  function getNations() {
    return new Promise((resolve, reject) => {
      SQLconnection.getConnection((err, connection) => {
        connection.query(
          "SELECT name FROM TOWNY_NATIONS",
          (error, results, fields) => {
            if (error) return reject(error);
            connection.release();
            let nations = [];
            results.forEach((result) => {
              nations.push(result.name);
            });
            resolve(nations);
          }
        );
      });
    });
  }
  getNations().then((data) => {
    res.json(data);
  });
});

function getResidents(townName) {
  return new Promise((resolve, reject) => {
    SQLconnection.getConnection((err, connection) => {
      connection.query(
        `SELECT * FROM TOWNY_RESIDENTS WHERE town = '${townName}'`,
        (error, results, fields) => {
          if (error) return reject(error);
          connection.release();
          let dataPacket = results;
          let residents = dataPacket.map((resident) => resident.name);

          resolve({
            residents,
          });
        }
      );
    });
  });
}

router.get("/town/:name", (req, res) => {
  let townName = req.params.name;

  function getData(townName) {
    return new Promise((resolve, reject) => {
      SQLconnection.getConnection((err, connection) => {
        connection.query(
          `SELECT * FROM TOWNY_TOWNS WHERE name = '${townName}'`,
          (error, results, fields) => {
            if (error) return reject(error);
            connection.release();
            let dataPacket = results[0];
            let name = dataPacket.name ? dataPacket.name : reject("Inexistant");
            let mayor = dataPacket.mayor;
            let nation = dataPacket.nation ? dataPacket.nation : "none";
            let assistants = dataPacket.assistants
              ? dataPacket.assistants.split("#")
              : "none";
            let board;
            if (dataPacket.townBoard == "/town set board [msg]") {
              board = "none";
            } else {
              board = dataPacket.townBoard;
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
              name,
              mayor,
              nation,
              assistants,
              board,
              isOpen,
              tag,
              registered,
            });
          }
        );
      });
    });
  }

  Promise.all([getData(townName), getResidents(townName)]).then((data) => {
    let town = data[0];
    let residents = data[1];
    res.json({
      name: town.name,
      mayor: town.mayor,
      nation: town.nation,
      assistants: town.assistants,
      townBoard: town.board,
      isOpen: town.isOpen,
      tag: town.tag,
      registered: town.registered,
      residents: residents.residents,
    });
  });
});

router.get("/nation/:name", (req, res) => {
  let nationName = req.params.name;

  function getData(nationName) {
    return new Promise((resolve, reject) => {
      SQLconnection.getConnection((err, connection) => {
        connection.query(
          `SELECT * FROM TOWNY_NATIONS WHERE name = '${nationName}'`,
          (error, results, fields) => {
            if (error) return reject(error);
            connection.release();
            let dataPacket = results[0];
            let name = dataPacket.name;
            let capital = dataPacket.capital;
            let assistants = dataPacket.assistants
              ? dataPacket.assistants.split("#")
              : "none";
            let board;
            if (dataPacket.nationBoard == "/nation set board [msg]") {
              board = "none";
            } else {
              board = dataPacket.nationBoard;
            }
            let isOpen;
            if ((dataPacket.open = "1")) {
              isOpen = true;
            } else {
              isOpen = false;
            }
            let tag = dataPacket.tag ? dataPacket.tag : "none";
            let registered = dataPacket.registered;
            let color = dataPacket.mapColorHexCode;

            resolve({
              name,
              capital,
              assistants,
              board,
              isOpen,
              tag,
              registered,
              color,
            });
          }
        );
      });
    });
  }

  function getTowns(nationName) {
    return new Promise((resolve, reject) => {
      SQLconnection.getConnection((err, connection) => {
        connection.query(
          `SELECT * FROM TOWNY_TOWNS WHERE nation = '${nationName}'`,
          (error, results, fields) => {
            if (error) return reject(error);
            connection.release();
            let dataPacket = results;
            let towns = dataPacket.map((town) => town.name);

            let getTownsResidents = new Promise((resolve, reject) => {
              let residents = [];
              towns.forEach((town, index, array) => {
                getResidents(town).then((townResidents) => {
                  townResidents.residents.forEach((resident) => {
                    residents.push(resident);
                    if (index === array.length - 1) resolve(residents);
                  });
                });
              });
            });
            getTownsResidents.then((residents) => {
              resolve({
                towns,
                residents,
              });
            });
          }
        );
      });
    });
  }

  function getKing(nationName) {
    return new Promise((resolve, reject) => {
      SQLconnection.getConnection((err, connection) => {
        connection.query(
          `SELECT * FROM TOWNY_NATIONS WHERE name = '${nationName}'`,
          (error, results, fields) => {
            if (error) return reject(error);
            connection.release;
            let dataPacket = results[0];
            let capital = dataPacket.capital;

            let getMayor = new Promise((resolve, reject) => {
              SQLconnection.getConnection((err, connection) => {
                connection.query(
                  `SELECT * FROM TOWNY_TOWNS WHERE name = '${capital}'`,
                  (error, results, fields) => {
                    if (error) return reject(error);
                    connection.release();
                    let dataPacket = results[0];
                    let mayor = dataPacket.mayor;

                    resolve({
                      mayor,
                    });
                  }
                );
              });
            });

            getMayor.then((mayor) => {
              let king = mayor.mayor;
              resolve({ king });
            });
          }
        );
      });
    });
  }

  Promise.all([
    getData(nationName),
    getTowns(nationName),
    getKing(nationName),
  ]).then((data) => {
    let nation = data[0];
    let towns = data[1];
    let king = data[2];

    res.json({
      name: nation.name,
      capital: nation.capital,
      king: king.king,
      assistants: nation.assistants,
      nationBoard: nation.board,
      isOpen: nation.isOpen,
      tag: nation.tag,
      registered: nation.registered,
      towns: towns.towns,
      residents: towns.residents,
      color: nation.color,
    });
  });
});

router.get("/player/:id", async (req, res) => {
  let playerName = req.params.id;
  fetch("https://api.ashcon.app/mojang/v2/user/" + playerName)
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        return res.json({ success: false });
      }
    });
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
      SQLconnection.getConnection((err, connection) => {
        connection.query(
          `SELECT * FROM luckperms_user_permissions WHERE uuid = '${uuid}'`,
          (error, results, fields) => {
            if (error) return reject(error);
            connection.release();
            let groups = [];
            results.forEach((result) => {
              groups.push(result.permission.slice(6));
            });
            resolve(groups);
          }
        );
      });
    });
  }

  function getTown(username) {
    return new Promise((resolve, reject) => {
      SQLconnection.getConnection((err, connection) => {
        connection.query(
          `SELECT * FROM TOWNY_RESIDENTS WHERE name = '${username}'`,
          (error, results, fields) => {
            if (error) return reject(error);
            connection.release();
            let dataPacket = results[0];
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
    });
  }

  async function getUserData(uuid) {
    return new Promise(async (resolve, reject) => {
      fs.readdir("./tmp", (err, files) => {
        files.forEach((file) =>
          fs.unlink("./tmp/" + file, (err) => {
            if (err) throw err;
          })
        );
      });
      try {
        const userdata = await downloadUserData(uuid);
        let money = userdata.money;
        let isAfk = userdata.afk;
        let logoutLocation = {
          x: userdata["logoutlocation"]["x"],
          y: userdata["logoutlocation"]["y"],
          z: userdata["logoutlocation"]["z"],
          world: userdata["logoutlocation"]["world"],
        };
        let nickname = userdata.nickname
          ? userdata.nickname !== username
            ? userdata.nickname
            : "none"
          : "none";
        resolve({ money, isAfk, logoutLocation, nickname });
      } catch (err) {
        console.error(err);
        return res.json({ success: false });
      }
    });
  }

  async function downloadUserData(uuid) {
    const client = new ftp.Client((timeout = 20000));
    client.ftp.verbose = true;
    try {
      await client.access({
        host: FTPhost,
        user: FTPuser,
        password: FTPpass,
        secure: false,
      });
      client.trackProgress((info) => console.log(info.bytesOverall));
      await client.downloadTo(
        `./tmp/${uuid}.yml`,
        `/plugins/Essentials/userdata/${uuid}.yml`
      );
      let dataObject = JSON.stringify(
        yaml.load(fs.readFileSync(`./tmp/${uuid}.yml`, { encoding: "utf-8" }))
      );
      fs.writeFileSync(`./tmp/${uuid}.json`, dataObject);
      return require(`../tmp/${uuid}.json`);
    } catch (err) {
      console.log(err);
    }
    client.close();
  }

  Promise.all([getGroups(uuid), getTown(username), getUserData(uuid)])
    .then((data) => {
      let groupsData = data[0];
      let townData = data[1];
      let userData = data[2];
      res.json({
        success: true,
        uuid: uuid,
        username: username,
        isOnline: isOnline,
        skinRenderURL:
          "https://visage.surgeplay.com/bust/512/" + cleanUUID + ".png",
        groups: groupsData,
        town: townData.town,
        townRank: townData.townRank,
        nationRank: townData.nationRank,
        friends: townData.friends,
        lastOnline: townData.lastOnline,
        money: userData.money,
        isAfk: userData.isAfk,
        logoutLocation: userData.logoutLocation,
        nickname: userData.nickname,
      });
    })
    .catch((err) => console.error(err));
});

module.exports = router;
