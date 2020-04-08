const baseURL = 'https://www.heviva.ch/institutions.html'
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

let ems = []

const fetchUrl = async (url) => {
  return await axios.get(url)
}

const fetchData = async (url) => {
  const result = await fetchUrl(url)
  return await cheerio.load(result.data)
}

const scrapeBase = async () => {
  let $ = await fetchData(baseURL)
  items = $('.emsListContainer > .list > .item') // get all .item
  $(items).each(async function(i, item) {
    let thisEMS = {}
    thisEMS.id = i
    console.log('\n---\nScraping EMS id#' + i)
    // EMS URL
    thisEMS.url = 'https://www.heviva.ch/' + $(item).attr('href')

    // EMS Name
    thisEMS.name = $('.desc > .info-text > .header', item).text()

    // EMS Address
    let address = $('.desc > .info-text > .details > .address', item).html().split("<br>")
    thisEMS.address1 = address[0]
    thisEMS.address2 = address[1]

    // EMS Phone
    thisEMS.phone = $('.desc > .info-text > .details > .phone', item).text().split("Tél: ")[1]

    // EMS Fax
    thisEMS.fax = $('.desc > .info-text > .details > .fax', item).text().split("Fax: ")[1]

    // EMS Image
    thisEMS.imgLink = $('.pic > img', item).attr('src')

    // EMS Image map
    thisEMS.imgMapLink = $('.picture_map > img', item).attr('src')

    console.table(thisEMS)
    ems.push(thisEMS)
  })
}

const scrapeDetails = async (url) => {
  // EMS Full details
  let thisEMSdetails = {}
  let $ = await fetchData(url)
  console.log('\n---\nScraping EMS details from', url)
  thisEMSdetails.email = $('.emsSingleContainer .single .details2 .col3 .mail a').text()
  thisEMSdetails.direction = $('.emsSingleContainer .single .details2 .direction').text()
  return thisEMSdetails
}

const scrapeGeoData = async (q) => {
  let searchURL = 'https://nominatim.openstreetmap.org/search?q='+q+'&country=Switzerland&format=geojson'
  console.log('Scraping EMS geodata from', searchURL)
  geodata = await fetchUrl(searchURL)
  let lon, lat = ''
  try {
    lon = geodata.data.features[0].geometry.coordinates[0]
  } catch(e) {}
  try {
    lat = geodata.data.features[0].geometry.coordinates[1]
  } catch(e) {}
  
  return {lon, lat}
}

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 4))
  } catch (err) {
    console.error(err)
  }
}

const run = async () => {
  await scrapeBase()
  for (var e in ems) {
    // Get EMS details
    details = await scrapeDetails(ems[e].url)
    ems[e]['email'] = details.email
    ems[e]['direction'] = details.direction
    
    // Get longitude and latitude
    geodata = await scrapeGeoData(ems[e].address1 + ', ' + ems[e].address2)
    console.log(geodata)
    ems[e]['lon'] = geodata.lon
    ems[e]['lat'] = geodata.lat
   }
   console.log('Writing data.json file')
   storeData(ems, './data.json')
}

run()
