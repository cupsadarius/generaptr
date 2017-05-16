const logger = require('../commons/logger');
const chalk = require('chalk');
const inquirer = require('inquirer');

const databaseTypeTrack = require('./databaseType');
const FileService = require('../fileOperations/fileService');

exports.questions = [
  {
    name: 'output',
    type: 'input',
    message: 'Raml output directory:',
    default: 'raml',
  },
];

exports.handler = (data) => {
  let fileService = new FileService(data.output);
  let schemaInfo;

  return fileService.createDirectoryStructure()
    .then(() => {
      return inquirer.prompt(databaseTypeTrack.questions).then(databaseTypeTrack.handler);
    })
    .then(schema => {
      // get reference of current schema information
      schemaInfo = schema;

      return fileService.generateSchemaTypeFiles(schemaInfo);
    })
    .then(() => {
      console.log(chalk.green('DataType files were created for the api spec.'));
      return fileService.generateSchemaTypeFiles(schemaInfo);
    })
    .then(() => {
      return fileService.generateSchemaExampleFiles(schemaInfo);
    })
    .then(() => {
      console.log(chalk.green('Example response were created for the api spec.'));
    }).then(() => {
      return fileService.generateSchemaApiFiles(schemaInfo);
    })
    .then(() => {
      console.log(chalk.green('Api spec has been created.'));
      return Promise.resolve();
    })
    .catch(exception => {
      logger.error(exception);
      return Promise.reject(exception);
    });
};
