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
  {
    name: 'name',
    type: 'input',
    message: 'Application name:',
  },
  {
    name: 'version',
    type: 'input',
    message: 'Version:',
  },
  {
    name: 'url',
    type: 'input',
    message: 'Base URL:',
  },
];

exports.handler = (data) => {
  let fileService = new FileService(data.output);
  let schemaInfo;

  return fileService.createDirectoryStructure()
    .then(() => {
      logger.info('reading database schema');
      return inquirer.prompt(databaseTypeTrack.questions).then(databaseTypeTrack.handler);
    })
    .then(schema => {
      // get reference of current schema information
      schemaInfo = schema;
      logger.info('generating raml data types');
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
      logger.info('generating example files');
      return fileService.generateSchemaExamplesFilesFromCache();
    })
    .then(() => {
      console.log(chalk.green('Example response were created for the api spec.'));
    }).then(() => {
      return fileService.generateSchemaApiFiles(schemaInfo, data);
    })
    .then(() => {
      logger.info('generating the api spec');
      console.log(chalk.green('Api spec has been created.'));
      return Promise.resolve();
    })
    .catch(exception => {
      logger.error(exception.message);
      return Promise.reject(exception);
    });
};
