const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let db = null;

const dbPath = path.join(__dirname, "covid19India.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Server running"));
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
};

initializeDbAndServer();

//API-1

const convertDbToResponse = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    statePopulation: dbObject.statePopulation,
  };
};

app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT * FROM STATES;`;

  const getStates = await db.all(getStatesQuery);

  response.send(
    getStates.map((eachState) => {
      convertDbToResponse(eachState);
    })
  );
});

//API-2

app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT * FROM STATES WHERE STATE_ID=${stateId};`;

  const getState = await db.get(getStateQuery);

  response.send(convertDbToResponse(getState));
});

//API-3

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addQuery = `
    INSERT INTO DISTRICT(DISTRICT_NAME,STATE_ID,CASES,CURED,ACTIVE,DEATHS) VALUES
    ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const addDistrict = await db.run(addQuery);
  response.send("District Successfully Added");
});

//API-4

const convertDbToResponseDistrict = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT * FROM DISTRICT WHERE district_ID=${districtId};`;

  const getDistrict = await db.get(getDistrictQuery);

  response.send(convertDbToResponseDistrict(getDistrict));
});

//API-5
app.delete("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    Delete FROM DISTRICT WHERE district_ID=${districtId};`;

  const getDistrict = await db.run(getDistrictQuery);

  response.send("District Removed");
});

//API-6

app.put("/districts/:districtId", async (request, response) => {
  const districtDetails = request.body;
  const { districtId } = request.params;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addQuery = `
    UPDATE DISTRICT
    SET
    DISTRICT_NAME='${districtName}',
    STATE_ID=${stateId},CASES=${cases},CURED=${cured},
    ACTIVE=${active},DEATHS=${deaths}
    where district_id=${districtId}
    ;`;
  const addDistrict = await db.run(addQuery);
  response.send("District Details Updated");
});

//API-7

const convertStats = (object) => {
  return {
    totalCases: object.totalCases,
    totalCured: object.totalCured,
    totalActive: object.totalActive,
    totalDeath: object.totalDeath,
  };
};

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const statsQuery = `
    SELECT SUM(CASES) AS totalCases,
    SUM(CURED) AS totalCured,
    SUM(ACTIVE) AS totalActive,
    SUM(DEATHS) AS totalDeath
    FROM DISTRICT WHERE STATE_ID=${stateId};`;
  const getStats = await db.get(statsQuery);
  response.send(convertStats(getStats));
});

//API-8

convertState = (obj) => {
  return { stateName: obj.state_name };
};
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const statsQuery = `
    SELECT state_name
    FROM DISTRICT WHERE district_ID=${districtId};`;
  const getStats = await db.get(statsQuery);
  response.send(convertState(getStats));
});

module.exports = app;
