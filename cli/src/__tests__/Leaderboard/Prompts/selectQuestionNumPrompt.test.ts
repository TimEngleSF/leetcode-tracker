import { expect } from 'chai';
import sinon from 'sinon';
import chalk from 'chalk';
import { selectQuestionNum } from '../../../Leaderboard/Prompts/selectQuestionNumPrompt.js';
import { validate } from '../../../Leaderboard/Prompts/utils.js';

describe('selectQuestionNumPrompt', () => {
  let promptStub: any;

  beforeEach(() => {
    promptStub = sinon.stub();
  });

  it('should return a number', async () => {
    promptStub.resolves({ questID: 11 });
    const result = await selectQuestionNum(promptStub, true);
    expect(typeof result).to.eq('number');
  });

  describe('validate questNum', () => {
    it('should return true if input is a number between 0 and 2400', () => {
      const result = validate.questNum(11, true);
      expect(result).to.be.true;
    });
    it('should return "Question number must be between 0 and 2400" if input is less than 0', () => {
      const result = validate.questNum(-1, true);
      expect(result).to.eq(
        chalk.red('\nQuestion number must be between 0 and 2400')
      );
    });
    it('should return "Question number must be between 0 and 2400" if input is greater than 2400', () => {
      const result = validate.questNum(2500, true);
      expect(result).to.eq(
        chalk.red('\nQuestion number must be between 0 and 2400')
      );
    });
  });
});
