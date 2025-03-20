const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
var random = require('random-string-generator');

(async () => {
    // Creating a browser instance
  const browser = await puppeteer.launch();

  // Creating a new page
  const page = await browser.newPage();

  // Screen sizes ->  https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide

  // Adjusting width and height of the viewport
  await page.setViewport({ width: 1536, height: 864 });
  
  let urlLink = 'https://facebook.com';

  const url = new URL(urlLink);

  // Open URL in current page
  await page.goto(url.href);

  // The path to the new directory
  const dir = path.join("pictures", url.hostname);

  // Check if it exists
  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const fileName = random("lower") + ".png";

  const filePath = path.join(dir, fileName)

  // Capture screenshot
  await page.screenshot({
    path: filePath,
  });

  // Close the browser instance
  await browser.close();
})
();