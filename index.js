const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const viewports = require("./sizes/viewports.json");
const { getCSVData, writeToCSV } = require("./utils/csv_reader");
const { setTimeout } = require("node:timers/promises");
require('dotenv').config();

const elementCapture = async (elements, v, elmnt, dir) => {
  let k = 0;
  const start = Date.now();
  let s = 0;
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];

    let box = await element.boundingBox();
    if (!box || box.height < 75 || box.width < 75) {
      continue;
    }

    let path1 = path.join(dir, `${v}_${elmnt}_${i + 1}.png`);
    await element.screenshot({ path: path1 });

    let stats = fs.statSync(path1);
    let bytes = stats.size;
    let kbs = bytes / 1024;

    s = s + kbs;
    k = k + 1;
  }
  const end = Date.now();
  const duration = ((end - start) / 1000).toFixed(2);
  return { elements_captured: k, duration, size: s };
}

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

  for (urlLink of urls) {
    // let urlLink = 'https://facebook.com/';

    const url = new URL(urlLink);

    // Try visiting the url first
    let response = await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 0 });
    if (response == null || response.status() !== 200) {
      console.log(`URL not accessed: ${urlLink} -> Status : ${response.status()}`)
      continue;
    }

    // // Open URL in current page
    // await page.goto(url.href, { waitUntil: "networkidle0"});

    // The path to the screenshot directory
    const dir = path.join(process.env.SCREENSHOT_DIR, url.hostname);

    // Check if it exists
    if (!fs.existsSync(dir)) {
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
      captured: 0,
      divs_captured: 0,
      divs_captured_size: 0,
      divs_capture_duration: 0,
      sections_captured: 0,
      sections_captured_size: 0,
      sections_capture_duration: 0,
      forms_captured: 0,
      forms_captured_size: 0,
      forms_capture_duration: 0,
    }

    for (val of viewports) {
      let userAgent = val.userAgent;
      let e = val.elements;
      for (v of val.sizes) {
        const page1 = await browser.newPage();
        try {
          let dimensions = v.split("x");
          let isMobile = true;
          //await page.setViewport({ width: Number(dimensions[0]), height: Number(dimensions[1])});
          await page1.emulate({ userAgent: userAgent, viewport: { width: Number(dimensions[0]), height: Number(dimensions[1]), isMobile: isMobile } });

          // The start time
          const start = Date.now();
          // Open URL in current page
          await page1.goto(url.href, { waitUntil: "load", timeout: 0 });

          const fileName = v + ".png";

          const filePath = path.join(dir, fileName);

          await setTimeout(500);

          // Capture screenshot
          await page1.screenshot({
            path: filePath,
            // fullPage: true
          });

          const end = Date.now();
          const duration = ((end - start) / 1000).toFixed(2);

          // Write to output
          record[v + "_duration"] = duration;
          record.captured = record.captured + 1;

          // Get file size
          let stats = fs.statSync(filePath);
          let bytes = stats.size;
          let kbs = bytes / 1024;
          record[v + "_size"] = kbs.toFixed(2);

          // Take elements Screenshots if it exists in elements
          if (e.includes(v)) {
            // Div
            const divHandles = await page1.$$('div');
            const divs = await elementCapture(divHandles, v, 'div', dir);
            record.divs_captured = record.divs_captured + divs.elements_captured;
            record.divs_capture_duration = record.divs_capture_duration + Number(divs.duration);
            record.divs_captured_size = record.divs_captured_size + divs.size;

            // Section
            const sectionHandles = await page1.$$('section');
            const sections = await elementCapture(sectionHandles, v, 'section', dir);
            record.sections_captured = record.sections_captured + sections.elements_captured;
            record.sections_capture_duration = record.sections_capture_duration + Number(sections.duration);
            record.sections_captured_size = record.sections_captured_size + sections.size;

            // Forms
            const formHandles = await page1.$$('form');
            const forms = await elementCapture(formHandles, v, 'form', dir);
            record.forms_captured = record.forms_captured + forms.elements_captured;
            record.forms_capture_duration = record.forms_capture_duration + Number(forms.duration);
            record.forms_captured_size = record.forms_captured_size + forms.size;
          }

        } catch (err) {
          console.log(`Error accessing url: ${urlLink}`);
          console.log(`Error: ${err}`);
          record[v + "_duration"] = 0;
          record[v + "_size"] = 0;
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