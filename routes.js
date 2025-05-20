const express = require("express");
const { capture } = require("./utils/capture");
const { csvScreenshotCapture } = require("./utils/csv_screenshot_capture");

const routes = express.Router();

const getCapture = (req, res) => {
    res.render('capture');
}

const createCapture = async (req, res) => {
    let link = req.body.link;
    let scheme = "https://";
    try {
        await capture(scheme + link);
        res.status(201).send("Website capture completed successfully");
    } catch (er) {
        res.status(400).send(`Error: ${er}`);
    }
}

const csvCapture = async (req, res) => {
    try {
        await csvScreenshotCapture();
        res.status(201).send("CSV website capture completed successfully");
    } catch (er) {
        res.status(400).send(`Error: ${er}`);
    }
}

routes.get('/capture', getCapture);
routes.post('/capture', createCapture);
routes.get('/csv-capture', csvCapture);

module.exports = routes;