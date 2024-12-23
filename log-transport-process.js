var dotenv = require('dotenv');
dotenv.config();

var pinoCloudWatch = require('pino-cloudwatch');
var split = require('split2');
var pump = require('pump');
var through = require('through2');

const logToStdOutTransformer = through.obj(function(chunk, enc, cb) {
  console.log(chunk);

  if (String(process.env.LOGGER_STORAGE_CLOUDWATCH_ENABLED) === 'true') {
    this.push(chunk);
  }

  cb();
});

let cloudwatchTransport;
if (String(process.env.LOGGER_STORAGE_CLOUDWATCH_ENABLED) === 'true') {
  cloudwatchTransport = pinoCloudWatch({
    group: process.env.LOGGER_STORAGE_CLOUDWATCH_LOG_GROUP,
    aws_region: process.env.LOGGER_STORAGE_CLOUDWATCH_REGION,
    interval: process.env.LOGGER_STORAGE_CLOUDWATCH_INTERVAL,
    stdout: false,
  });
}

pump(process.stdin, split(), logToStdOutTransformer, cloudwatchTransport);
