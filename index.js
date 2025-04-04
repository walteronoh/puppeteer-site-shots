const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const viewports = require("./sizes/viewports.json");

(async () => {
    // Creating a browser instance
  const browser = await puppeteer.launch({
    headless: false
  });

  // Creating a new page
  const page = await browser.newPage();
  
  let urlLink = 'https://equityonline.equitygroupholdings.com/';

  const url = new URL(urlLink);

  // Open URL in current page
  await page.goto(url.href, { waitUntil: "networkidle0"});

  // The path to the screenshot directory
  const dir = path.join("screenshots", url.hostname);

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

  // Hide scrollbars
  await page.evaluate(() => {
    document.body.style.overflowY = 'hidden';
  });
  
  const viewportsList = [...viewports.desktop, ...viewports.tablet, ...viewports.mobile]
  for(v of viewportsList) {
    let dimensions = v.split("x");
    await page.setViewport({ width: Number(dimensions[0]), height: Number(dimensions[1])});

    const fileName = v + ".png";

    const filePath = path.join(dir, fileName)
  
    // Capture screenshot
    await page.screenshot({
      path: filePath,
      // fullPage: true
    });
  };
  

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