const baseURL = 'https://www.heviva.ch/institutions.html'
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

let ems = []

const fetchData = async (url) => {
  const result = await axios.get(url)
  return await cheerio.load(result.data)
}

const scrapeBase = async () => {
  let $ = await fetchData(baseURL)
  items = $('.emsListContainer > .list > .item') // get all .item
  $(items).each(async function(i, item) {
    let thisEMS = {}
    thisEMS.id = i
    console.log('\n---\nScraping EMS id#' + i)
    // URL l'EMS
    thisEMS.url = 'https://www.heviva.ch/' + $(item).attr('href')

    // Nom de l'EMS
    thisEMS.name = $('.desc > .info-text > .header', item).text()

    // Adresse
    let address = $('.desc > .info-text > .details > .address', item).html().split("<br>")
    thisEMS.address1 = address[0]
    thisEMS.address2 = address[1]

    // Téléphone
    thisEMS.phone = $('.desc > .info-text > .details > .phone', item).text().split("Tél: ")[1]

    // Fax
    thisEMS.fax = $('.desc > .info-text > .details > .fax', item).text().split("Fax: ")[1]

    // Image
    thisEMS.imgLink = $('.pic > img', item).attr('src')

    // Image map
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

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}

const run = async () => {
  await scrapeBase()
  for (var e in ems) {
     details = await scrapeDetails(ems[e].url)
     ems[e]['email'] = details.email
     ems[e]['direction'] = details.direction
   }
   // console.log(ems)
   storeData(ems, './data.json')
}

run()
