const fs = require('fs')
let converter = require('json-2-csv')

let json2csvCallback = (err, csv) => {
    if (err) throw err
    console.log(csv)
}

const loadData = (path) => {
  try {
    return fs.readFileSync(path, 'utf8')
  } catch (err) {
    console.error(err)
    return false
  }
}
converter.json2csv(JSON.parse(loadData('./data.json')), json2csvCallback)