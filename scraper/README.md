# Quotes Scraper

A simple Node.js scraper that fetches quotes from [quotes.toscrape.com](http://quotes.toscrape.com) and saves them to `quotes.json`. 
This was made under assignment The polite scraper for Backend AI Engineering track of FlyRank AI Internship.

## What it does

- Sends a request to the quotes page using `axios`
- Parses HTML with `cheerio`
- Extracts quote text and author
- Saves results with a timestamp (`scrapedAt`) into `quotes.json`

## Requirements

- Node.js 18+ (recommended)
- npm

## Installation

```bash
npm install
```

## Run the scraper

```bash
node scraper.js
```

If successful, you should see output like:

- `Fetching data...`
- `Successfully saved X quotes to quotes.json`

