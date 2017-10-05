const { PORT } = process.env

const express = require('express'),
  bodyParser = require('body-parser'),
  keanu = require('./index'),
  app = express()


// json body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// endpoint for slack requests
app.post('/incoming', keanu.handler)


// start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})