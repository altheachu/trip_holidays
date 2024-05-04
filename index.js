import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://date.nager.at";

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.listen(port, ()=>{
  console.log(`Listening on port ${port}`)
})

app.get("/", async (req, res) => {
  try {
    const result = await axios.get(API_URL + "/api/v3/AvailableCountries");
    const country_obj = {
      countries: result.data,
    }
    res.render("index.ejs", country_obj);
  } catch(error) {
    console.log(error);
  }
  
})

// https://date.nager.at/swagger/index.html
