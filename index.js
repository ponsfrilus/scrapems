const baseURL = 'https://www.heviva.ch/institutions.html'
const axios = require('axios')
const cheerio = require('cheerio')

const fetchData = async (url) => {
  const result = await axios.get(url)
  return await cheerio.load(result.data)
}

async function scrape () {

  let $ = await fetchData(baseURL)

  items = $('.emsListContainer > .list > .item') // get all .item
   $(items).each(async function(i, item){
     console.log('\n\n---\n' + i)
     // URL l'EMS
     let pageURL = 'https://www.heviva.ch/' + $(item).attr('href')
     console.log(pageURL)
     // Nom de l'EMS
     console.log($('.desc > .info-text > .header', item).text())
     // Adresse
     let address = $('.desc > .info-text > .details > .address', item).html().split("<br>")
     console.log(address)
     // Téléphone
     console.log($('.desc > .info-text > .details > .phone', item).text())
     // Fax
     console.log($('.desc > .info-text > .details > .fax', item).text())
     // Image
     console.log($('.pic > img', item).attr('src'))
     // Image map
     console.log($('.picture_map > img', item).attr('src'))
     
     // EMS Full details
     let d = await fetchData(pageURL)
     details = d('.emsSingleContainer')
     d(details).each(async function(di, det){
       // console.log(i)
       // console.log(det)
       // console.log($('.text', det).text())
       // console.log($('.details2 > .address', det).text())
       // console.log($('.details2 > .location', det).text())
       // console.log($('.details2 > .google-maps', det).text())
       // console.log($('.details2 > .direction', det).text())
       // console.log($('.details2 > .phone', det).text())
       // console.log($('.details2 > .fax', det).text())
       //console.log($('.mail a', det).attr('href'))
       let email = $('.mail a', det).text()
       console.log(email)
     })
   })
}

scrape()
