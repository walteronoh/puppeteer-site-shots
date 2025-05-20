const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const viewports = require("../sizes/viewports.json");
const { getCSVData, writeToCSV } = require("./csv_reader");
const { setTimeout } = require("node:timers/promises");
const { capture } = require("./capture");
require('dotenv').config();

const csvScreenshotCapture = async () => {
  let urls = await getCSVData();

  urls.slice(0, 11);

  for (urlLink of urls) {
    await capture(urlLink);
  }
}

module.exports = {
  csvScreenshotCapture
}