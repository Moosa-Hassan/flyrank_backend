const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = 'http://quotes.toscrape.com';
const USER_AGENT = 'MyDataScraper/1.0 (moosahassanalvi791@gmail.com)';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


async function runScraper() {
  try {
    console.log('Fetching data...');
    await delay(2000);

    
    const response = await axios.get(URL, {
      headers: { 'User-Agent': USER_AGENT }
    });

    const quote = cheerio.load(response.data);
    const quotes = [];

    quote('.quote').each((i, el) => {
      const text = quote(el).find('.text').text().trim();
      const author = quote(el).find('.author').text().trim();
      
      quotes.push({
        text: text.replace(/[“”]/g, ''),
        author: author,
        scrapedAt: new Date().toISOString()
      });
    });

    fs.writeFileSync('quotes.json', JSON.stringify(quotes, null, 2));
    console.log(`Successfully saved ${quotes.length} quotes to quotes.json`);

  } 
  catch (error){
    console.error('Error during scraping:', error.message);
  }
}

runScraper();