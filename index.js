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
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const destination = req.body.destination;
    const countriesResult = await axios.get(API_URL + "/api/v3/AvailableCountries");
    if (!validation(startDate, endDate, destination)){
      // TODO 改成前端驗證
      // const uiParamObj = {
      //   errorMsg: 'StartDate, endDate, destination should not be empty. StartDate must be earlier than endDate.',
      //   emptyMsg: undefined,
      //   msgShow: 'Y',
      //   tableShow: 'N',
      //   countries: countriesResult.data,
      // }
      // res.render("index.ejs", uiParamObj); 
      res.redirect('/');
    } else {
      if(getDateYear(startDate) == getDateYear(endDate)){
        const result = await axios.get(API_URL + `/api/v3/PublicHolidays/${getDateYear(startDate)}/${destination}`);
        const rList = result.data;
        let newResultList = rList.filter((item) => {
          return filterByDate(item, startDate, endDate)
        });
        console.log(newResultList);
        const msgShow = newResultList.length > 0? 'N': 'Y';
        const tableShow = newResultList.length > 0? 'Y' : 'N';
        const tmpMsg = `No National Holidays in ${destination} during ${startDate} and ${endDate}`;
        const emptyMsg = newResultList.length > 0? '': tmpMsg;

        const uiParamObj = {
          holidayList: newResultList,
          msgShow: msgShow,
          tableShow: tableShow,
          emptyMsg: emptyMsg,
          countries: countriesResult.data,
        };
        res.render("index.ejs", uiParamObj);
      } else {

      }
    }
  } catch(error) {
    console.log(error);
  }
  
})

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
// https://date.nager.at/swagger/index.html
