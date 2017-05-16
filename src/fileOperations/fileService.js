const fileUtil = require('../commons/utils/fileUtil');
const DIRECTORY_STRUCTURE = require('../commons/constants/directoryStructure');
const typesGenerator = require('../generators/spec/types');
const examplesGenerator = require('../generators/spec/examples');
const specGenerator = require('../generators/spec/spec');
const utils = require('../commons/utils/utils');
const cacheUtil = require('../commons/utils/cacheUtil');
const config = require('../configs/config');

class FileService {
  constructor(filePath) {
    if ((!filePath) || (typeof filePath !== 'string')) {
      throw new Error('FilePath not provided');
    }
    this.filePath = fileUtil.normalizePath(filePath);
  }

  /**
   * Create directory structure for the application
   * @returns {Promise} created directory structure.
   */
  createDirectoryStructure() {
    const promises = [];
    /* istanbul ignore next */
    if (!fileUtil.isDirectory(this.filePath)) {
      return Promise.reject('Invalid directory path');
    }
    Object.values(DIRECTORY_STRUCTURE).map(directory => {
      promises.push(fileUtil.createDirectory(fileUtil.joinPaths(this.filePath, directory)));
    });

    return Promise.all(promises);
  }

  /**
   * Create .raml type file for every table inside schema
   * @param {*} schema - schema tables(list of tables)
   * @returns {Promise.<*>} generated type files.
   */
  generateSchemaTypeFiles(schema) {
    const promises = [];

    schema.map(table => {
      promises.push(
        fileUtil.writeFile(
          fileUtil.joinPaths(this.filePath, DIRECTORY_STRUCTURE.TYPES, `${utils.toTitleCase(table.name)}.raml`),
          typesGenerator.generateTypeContent(table)
        )
      );
    });

    return Promise.all(promises);
  }

  generateSchemaApiFiles(schema) {
    return fileUtil.writeFile(
      fileUtil.joinPaths(this.filePath, 'api.raml'),
      specGenerator.generateContent(schema)
    );
  }

  /**
   * Generate .json entity for every table from schema.
   * File will be saved on path: ./raml/types/entityName.json
   * @param {*} schema - schema containing tables.
   * Table structure: {
     *  name: 'tableName',
     *  columns: [
     *   {
     *      name: 'id',
     *      ...
     *   }
     *  ]
     * }
   * @return {Promise.<*>} generated examle files.
   */
  generateSchemaExampleFiles(schema) {
    const promises = [];

    schema.map(table => {
      const typeExampleGenerated = examplesGenerator.generateTypeExampleContent(schema, table, config.INITIAL_DEPTH_LEVEL);

      promises.push(
        fileUtil.writeFile(
          fileUtil.joinPaths(this.filePath, DIRECTORY_STRUCTURE.EXAMPLES, `${typeExampleGenerated.type}.json`),
          utils.convertToJSON(typeExampleGenerated.data)
        )
      );
    });

    return Promise.all(promises);
  }

  /**
   * Generate .json Array entity for every array of objects saved in cache
   * @return {Promise.<*>} generated example files.
   */
  generateSchemaExamplesFilesFromCache() {
    const promises = [];

    Object.keys(cacheUtil.getByPrimeKey(examplesGenerator.PRIME_KEY))
      .filter(key => key.includes('[]'))
      .map(key => {
        promises.push(
          fileUtil.writeFile(
            fileUtil.joinPaths(this.filePath, DIRECTORY_STRUCTURE.EXAMPLES, `${utils.pluraliseWordArray(key)}.json`),
            utils.convertToJSON(cacheUtil.get(examplesGenerator.PRIME_KEY, key))
          ));
      });

    return Promise.all(promises);
  }
}

module.exports = FileService;
