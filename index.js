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

app.post("/search", async (req, res) => {
  try {
    console.log('req', req.body);
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const destination = req.body.destination;
    if (!validation(startDate, endDate, destination)){
      console.log("not pass validation");
      res.render("index.ejs", null); 
    } else {
      if(getDateYear(startDate) == getDateYear(endDate)){
        const result = await axios.get(API_URL + `/api/v3/PublicHolidays/${getDateYear(startDate)}/${destination}`);
        console.log(result);
        // filter
        res.render("index.ejs", null);
      } else {

      }
    }
  } catch(error) {
    console.log(error);
  }
  
})

function validation(startDate, endDate, destination){
  let flag = true;
  const criteria1 = startDate===undefined||startDate===''||startDate===null;
  const criteria2 = endDate===undefined||endDate===''||endDate===null;
  const criteria3 = destination===undefined||destination===''||destination===null;
  if (criteria1||criteria2||criteria3){
    flag = false;
  }
  if(dateCompare(startDate, endDate) < 0){
    flag = false;
  }
  return flag;
}

function getDateYear(dateStr){
  let date = new Date(Date.parse(dateStr));
  return date.getFullYear();
}

function dateCompare(dateStr1, dateStr2){
  const date1 = Date.parse(dateStr1);
  const date2 = Date.parse(dateStr2);
  if (date2 < date1){
    return -1;
  } else if(date2 == date1){
    return 0;
  } else {
    return 1;
  }
}
// https://date.nager.at/swagger/index.html