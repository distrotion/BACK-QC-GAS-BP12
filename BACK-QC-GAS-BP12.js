const express = require('express')
const app = express()
const cors = require("cors")
const router = express.Router();
const bodyParser = require('body-parser');
const port = 16180

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
// app.use(bodyParser.json({limit: '150mb'}));
// to support URL-encoded bodies
// 
app.use(bodyParser.urlencoded({     
limit: '150MB',
extended: true
})); 
// app.use(express.limit('10M'));
app.use(cors())

app.use("/", require("./api"))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})

