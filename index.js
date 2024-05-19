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
    const today = new Date();
    const startDate = formatDate(today);
    const endDate = formatDate(addDate(today, 14));
    const country_obj = {
      countries: result.data,
      startDate: startDate,
      endDate: endDate,
      msgShow: false,
    }
    res.render("index.ejs", country_obj);
  } catch(error) {
    console.log(error);
  }
  
})

app.post("/search", async (req, res) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const destination = req.body.destination;
    const countriesResult = await axios.get(API_URL + "/api/v3/AvailableCountries");
    if (!validation(startDate, endDate, destination)){
      res.redirect('/');
    } else {
      let uiParamObj = {
        startDate: startDate,
        endDate: endDate,
        countries: countriesResult.data,
      };
      let newResultList;
      const startResultList = await getResultList(startDate, destination);
      newResultList = startResultList.filter((item) => {
        return filterByDate(item, startDate, endDate)
      });
      if(getDateYear(startDate) !== getDateYear(endDate)){
        const endResultList = await getResultList(endDate, destination);
        let newEndYrList = endResultList.filter((item) => {
          return filterByDate(item, startDate, endDate)
        });
        newResultList = newResultList.concat(newEndYrList);
      }
      if(newResultList==0){
        uiParamObj.emptyFlag = "Y";
      } else {
        uiParamObj.holidayList = newResultList;
      }
      res.json(uiParamObj);
    }
  } catch(error) {
    console.log(error);
  }
})

function formatDate(date){
  // 瑞典慣用的日期格式是 yyyy-MM-dd HH:mm:ss
  let newDate = date.toLocaleString('sv');
  return newDate.substr(0,10);
}

function addDate(date, addDays){
  const longDate = date.setDate(date.getDate() + addDays);
  return new Date(longDate);
}

function filterByDate(item, startDate, endDate){
  if(dateCompare(item.date, startDate) <= 0 && dateCompare(item.date, endDate) >= 0){
    return true;
  } else {
    return false;
  }
}

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

async function getResultList(date, destination){
  const result = await axios.get(API_URL + `/api/v3/PublicHolidays/${getDateYear(date)}/${destination}`);
  return result.data;
}
