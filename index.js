const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const viewports = require("./sizes/viewports.json");
const { getCSVData, writeToCSV } = require("./utils/csv_reader");
require('dotenv').config();

(async () => {
    // Creating a browser instance
  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 30000
  });

  // Creating a new page
  const page = await browser.newPage();
  
  let urls = await getCSVData();

  // For testing, splice the array to 10
  urls.slice(0, 11);

  for(urlLink of urls) {
    // let urlLink = 'https://facebook.com/';

    const url = new URL(urlLink);

    // Try visiting the url first
    let response = await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 0});
    if(response == null || response.status() !== 200) {
      console.log(`URL not accessed: ${urlLink} -> Status : ${response.status()}`)
      continue;
    }
  
    // // Open URL in current page
    // await page.goto(url.href, { waitUntil: "networkidle0"});
  
    // The path to the screenshot directory
    const dir = path.join(process.env.SCREENSHOT_DIR, url.hostname);
  
    // Check if it exists
    if(!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  
  // // The path to the screencast directory
  // const dir1 = path.join("screencasts", url.hostname);
  
  // // Check if it exists
  // if(!fs.existsSync(dir1)) {
  //   fs.mkdirSync(dir1);
  // }
  
    
    // Screen sizes ->  https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide
  
    // const forms = await page.$$('form');
    // if (forms.length > 0) {
    //   console.log(`Found ${forms.length} forms on the page.`);
    //   await page.screenshot({ path: 'form_screenshot.png' });
    // }

    // // Open URL in current page
    // await page.goto(url.href, { waitUntil: "networkidle0"});

    let record = {
      website: urlLink,
      captured: 0
    }
  
  
    for(val of viewports) {
      let userAgent = val.userAgent;
      for(v of val.sizes) {
        const page1 = await browser.newPage();
        try {
          let dimensions = v.split("x");
          let isMobile = true;
          //await page.setViewport({ width: Number(dimensions[0]), height: Number(dimensions[1])});
          await page1.emulate({ userAgent : userAgent, viewport: { width: Number(dimensions[0]), height: Number(dimensions[1]), isMobile: isMobile }});
    
          // The start time
          const start = Date.now();
          // Open URL in current page
          await page1.goto(url.href, { waitUntil: "networkidle0", timeout: 50000});

          const fileName = v + ".png";
  
          const filePath = path.join(dir, fileName);
        
          // Capture screenshot
          await page1.screenshot({
            path: filePath,
            // fullPage: true
          });

          const end = Date.now();
          const duration = ((end - start) / 1000).toFixed(2);
          
          // Write to output
          record[v] = duration;
          record.captured = record.captured + 1;
        } catch(err) {
          console.log(`Error accessing url: ${urlLink}`);
          console.log(`Error: ${err}`);
          record[v] = 0;
          continue;
        } finally {
           // Reload the page
           //await page.reload();
           await page1.close();
        }
      }
    }
    writeToCSV([record]);
    // await page.close();
  }

  // // screencast
  // const screenCastPath = path.join(dir1, "screencast.webm");
  // const recorder = await page.screencast({ path: screenCastPath });
  // await recorder.stop();

  // Adjusting width and height of the viewport
  // await page.setViewport({ width: 1536, height: 864 });

  // const fileName = "1536x864" + ".png";

  // const filePath = path.join(dir, fileName)

  // // Capture screenshot
  // await page.screenshot({
  //   path: filePath,
  // });

  // Close the browser instance
  await browser.close();
})
();