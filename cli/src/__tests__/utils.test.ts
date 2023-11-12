import { expect } from 'chai';
import figlet from 'figlet';
import chalk from 'chalk';
import sinon from 'sinon';

import { getUserJSON, printHeader, logout, getQuestionData } from '../utils.js';
import loginUser from '../Auth/loginUser.js';

describe('Utility functions', () => {
  describe('getUserJSON function', () => {
    let userJSON: any;

    before(async () => {
      userJSON = await getUserJSON();
    });

    it('should return a JavaScript object', async () => {
      expect(userJSON).to.be.an('object');
    });

    it('should contain LC_ID property as a string', async () => {
      expect(userJSON.LC_ID).to.be.a('string');
    });

    it('should contain LC_FIRSTNAME property as a string', async () => {
      expect(userJSON.LC_FIRSTNAME).to.be.a('string');
    });

    it('should contain LC_LASTINIT property as a string', async () => {
      expect(userJSON.LC_LASTINIT).to.be.a('string');
    });

    it('should contain LC_TOKEN property as a string', async () => {
      expect(userJSON.LC_TOKEN).to.be.a('string');
    });

    it('should contain LC_USERNAME property as a string', async () => {
      expect(userJSON.LC_USERNAME).to.be.a('string');
    });
  });

  describe('printHeader function', () => {
    it('should print the correct header', () => {
      let outputData = '';
      const storeLog = (inputs: any) => {
        outputData += inputs;
      };
      // Store console.log
      const originalLog = console.log;
      // Temporarily assign console.log to our storeLog to store the output of printHeader
      console.log = storeLog;

      printHeader();

      const expectedOutput = chalk.cyan(figlet.textSync('LeetCode Tracker'));
      expect(outputData).to.equal(expectedOutput);
      // Reassign console.log
      console.log = originalLog;
    });
  });

  describe('Logout function', () => {
    it('Should set all of the userJSON properties to null', async () => {
      // run logout()
      await logout();
      // run getUserJSON and store
      const jsonData = await getUserJSON();
      await loginUser('test@email.com', 'password');
      // check to see if each property is null using &&
      expect(
        jsonData.LC_FIRSTNAME &&
          jsonData.LC_ID &&
          jsonData.LC_TOKEN &&
          jsonData.LC_LASTINIT &&
          jsonData.LC_USERNAME
      ).to.not.exist;
    });
  });

  describe('getQuestionData function', () => {
    it('should return question data', async () => {
      const fakeData = { question: 'fake question' };

      // Create stubs for axios and getAuthHeaders
      const axiosStub = sinon.stub().resolves({ data: fakeData });
      const getAuthHeadersStub = sinon
        .stub()
        .resolves({ Authorization: 'Bearer fake_token' });

      const result = await getQuestionData(1, axiosStub, getAuthHeadersStub);

      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(axiosStub);
      sinon.assert.calledOnce(getAuthHeadersStub);
    });
  });
});
