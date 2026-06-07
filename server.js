const express = require('express')
const path = require('path')
const app = express()

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'))
})

app.listen(process.env.PORT || 3000)
