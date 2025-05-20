const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

// Set Pug as the templating engine
app.set('view engine', 'pug');

app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/views/static'));

app.use("/api", routes);

app.listen(port, () => {
  console.info(`server running: http://localhost:${port}`);
});
