//set up dependencies
const express = require("express");
const redis = require("redis");
const axios = require("axios");
const bodyParser = require("body-parser");

//setup port constants
const port_redis = process.env.PORT || 6379;
const port = process.env.PORT || 5000;

//configure redis client on port 6379
const redis_client = redis.createClient(port_redis);

//configure express server
const app = express();

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Middleware Function to Check Cache
checkCache = (req, res, next) => {
    const { day } = req.params;
  
    redis_client.get(id, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }
      //if no match found
      if (data != null) {
        res.send(data);
      } else {
        //proceed to next middleware function
        next();
      }
    });
  };

app.get("/activity/search/:day", async (req, res) => {
    try {
        const { day } = req.params;
        const getData = await axios.get(
            `https://sandbox.musement.com/api/v3/catalog/updates/${day}`
        );
        //get data from response
        const responseData = getData.data;

        //add Data to Redis
        redis_client.setex(day, 3600, JSON.stringify(responseData));

        return res.json(responseData);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
})

//listen on port 5000;
app.listen(port, () => console.log(`Server running on Port ${port}`));