import { expect } from 'chai';
import sinon from 'sinon';
import viewPrevQuestPrompt from '../../../Questions/Prompts/viewPrevQuestPrompt.js';

describe('viewPrevQuestionPrompt', () => {
  const selectionPrompt: any = sinon.stub();
  beforeEach(() => {
    selectionPrompt.reset();
  });

  it('should return a boolean', async () => {
    selectionPrompt.resolves({ viewPrev: true });
    const result = await viewPrevQuestPrompt(selectionPrompt);
    expect(typeof result).to.eq('boolean');
  });

  it('should return true when the user selects true', async () => {
    selectionPrompt.resolves({ viewPrev: true });
    const result = await viewPrevQuestPrompt(selectionPrompt);
    expect(result).to.be.true;
  });

  it('should return false when the user selects false', async () => {
    selectionPrompt.resolves({ viewPrev: false });
    const result = await viewPrevQuestPrompt(selectionPrompt);
    expect(result).to.be.false;
  });
});
