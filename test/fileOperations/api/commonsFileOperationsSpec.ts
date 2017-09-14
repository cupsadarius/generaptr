import * as assert from 'assert';
import * as fs from 'fs';
import fileUtil from '../../../src/commons/utils/fileUtil';
import DIRECTORY_STRUCTURE from '../../../src/commons/constants/directoryStructure';
import ApiFileOperations from '../../../src/fileOperations/ApiFileOperations';
import commonsFileOperations from '../../../src/fileOperations/api/commonsFileOperations';
import apiMocks from '../../testUtils/apiMocks';

describe('Suite for testing the CommonsFileOperations class', () => {
  it('should create util.js file', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    commonsFileOperations.initializeUtil(apiFileOperations.getFilePath())
      .then(async () => {
        fs.readFile(
          fileUtil.joinPaths(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.COMMONS,
            "util.js",
          ),
          (err: Error, data: Buffer) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.equal(data.toString(), apiMocks.VALID_UTIL_CLASS);
            done();
          });
      })
      .catch((ex: Error) => {
        assert.fail(ex.message);
        done();
      });
  });

  it('should create statusCode.js file', (done: Function) => {
    const apiFileOperations: ApiFileOperations = new ApiFileOperations('api.test');

    commonsFileOperations.initializeConstants(apiFileOperations.getFilePath())
      .then(async () => {
        fs.readFile(
          fileUtil.joinPaths(
            apiFileOperations.getFilePath(),
            DIRECTORY_STRUCTURE.API_STRUCTURE.CONSTANTS,
            'statusCode.js',
          ),
          (err: Error, data: Buffer) => {
            assert.ifError(err);
            assert(data, 'Content should not be empty');
            assert.equal(data.toString(), apiMocks.VALID_STATUS_CODES_CONSTANTS);
            done();
          });
      })
      .catch((ex: Error) => {
        assert.fail(ex.message);
        done();
      });
  });
});
