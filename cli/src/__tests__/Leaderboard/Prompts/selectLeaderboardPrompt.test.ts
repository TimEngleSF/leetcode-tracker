import { expect } from 'chai';
import sinon from 'sinon';
import { selectLeaderboard } from '../../../Leaderboard/Prompts/selectLeaderboardPrompt.js';

describe('selectLeaderboardPrompt', () => {
  const promptStub: any = sinon.stub();
  beforeEach(() => {
    promptStub.reset();
  });

  it('should return a string', async () => {
    promptStub.resolves({ lbSelection: 'some string' });
    const result = await selectLeaderboard(promptStub, true);
    expect(result).to.be.a.string;
  });
  it('should return "question" when "Leadeboard By Question" is selected', async () => {
    promptStub.resolves({ lbSelection: 'question' });
    const result = await selectLeaderboard(promptStub, true);
    expect(result).to.eq('question');
  });
  it('should return "general" when "Overall Leadeboard" is selected', async () => {
    promptStub.resolves({ lbSelection: 'general' });
    const result = await selectLeaderboard(promptStub, true);
    expect(result).to.eq('general');
  });
});
