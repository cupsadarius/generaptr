const inquirer    = require('inquirer');
const cli = require('../cli');
const mysql = require('./relational/mysql');

const questions = [
  {
    name: 'databaseEngine',
    type: 'list',
    message: 'Database engine:',
    choices: ['MySql', 'Postgresql', 'Sqlite'],
    default: ['Mysql'],
  }
];

module.exports = () => {
  return new Promise((resolve, reject) => {
    inquirer.prompt(questions).then(driver => {
      if (driver.databaseEngine !== 'MySql') {
        return console.log(chalk.red(`${driver.databaseEngine} not supported yet.`));
      }
      inquirer.prompt(mysql).then(connectionData => {
        cli.handleMysqlConnection(connectionData).then(schema => {
          resolve(schema);
        });
      });
    });
  });
};
