import { expect } from 'chai';
import sinon from 'sinon';
import chalk from 'chalk';
import addQuestionPrompt from '../../../Questions/Prompts/addQuestionPrompt.js';
import { validate } from '../../../Questions/Prompts/validation.js';

describe('addQuestionPrompt', () => {
  describe('addQuestionPrompt', () => {
    let promptStub: any;
    let getQuestionDataStub: any;
    beforeEach(() => {
      promptStub = sinon.stub();
      getQuestionDataStub = sinon.stub();
    });

    it('should ask the right questions and return the right data', async () => {
      promptStub.onCall(0).resolves({ questNum: 99 });
      getQuestionDataStub.resolves({ title: 'Test Question', diff: 'Easy' });
      promptStub
        .onCall(1)
        .resolves({ passed: true, isAddTimeValid: true, speed: 100 });

      const result = await addQuestionPrompt(
        promptStub,
        getQuestionDataStub,
        true
      );

      expect(promptStub.callCount).to.equal(2);
      expect(getQuestionDataStub.callCount).to.equal(1);
      expect(getQuestionDataStub.calledWith(99)).to.be.true;
      expect(result).to.deep.equal({
        questNum: 99,
        passed: true,
        isAddTimeValid: true,
        speed: 100,
      });
    });

    it('should have null speed if isAddTimeValid is false', async () => {
      promptStub.onCall(0).resolves({ questNum: 24 });
      getQuestionDataStub.resolves({ title: 'Another Test', diff: 'Hard' });
      promptStub
        .onCall(1)
        .resolves({ passed: true, isAddTimeValid: false, speed: null });

      const result = await addQuestionPrompt(
        promptStub,
        getQuestionDataStub,
        true
      );

      expect(promptStub.callCount).to.equal(2);
      expect(getQuestionDataStub.callCount).to.equal(1);
      expect(getQuestionDataStub.calledWith(24)).to.be.true;
      expect(result).to.deep.equal({
        questNum: 24,
        passed: true,
        isAddTimeValid: false,
        speed: null,
      });
    });

    describe('error handling', () => {
      it('should handle invalid questNum input', async () => {
        promptStub.onCall(0).rejects(new Error('Invalid question number'));
        promptStub.onCall(1).resolves({ retry: false });

        const result = await addQuestionPrompt(
          promptStub,
          getQuestionDataStub,
          true
        );

        expect(result).to.equal(null);
      });
    });
  });

  describe('validateQuestNum', () => {
    it('should return true for valid numbers', async () => {
      const result = await validate.questNum(42, true);
      expect(result).to.equal(true);
    });

    it('should return an error message for invalid numbers', async () => {
      const result = await validate.questNum(10000, true); // or 0, or any invalid number
      expect(result).to.equal(chalk.red('\nNumber should be from 1 to 2400'));
    });
  });

  describe('validateSpeed', () => {
    it('should return true for a valid speed', async () => {
      const result = await validate.speed(42, true);
      expect(result).to.equal(true);
    });

    it('should return an error message for values less than 0', async () => {
      const result = await validate.speed(-1, true);
      expect(result).to.equal(
        chalk.red('\nNumber must be between 0 and 10000\nOr no input')
      );
    });

    it('should return an error message for values greater than 10000', async () => {
      const result = await validate.speed(99999, true);
      expect(result).to.equal(
        chalk.red('\nNumber must be between 0 and 10000\nOr no input')
      );
    });
  });
});
