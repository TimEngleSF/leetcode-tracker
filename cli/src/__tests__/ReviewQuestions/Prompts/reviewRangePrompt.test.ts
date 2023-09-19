import { expect } from 'chai';
import sinon from 'sinon';
import reviewRangePrompt from '../../../ReviewQuestions/Prompts/reviewRangePrompt.js';

describe('reviewRangePrompt', () => {
  let inquirerStub: any;

  beforeEach(() => {
    inquirerStub = sinon.stub().resolves({ timeSelection: 7 });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call inquirer.prompt with correct arguments', async () => {
    await reviewRangePrompt(inquirerStub);

    expect(inquirerStub.calledOnce).to.be.true;
    const args = inquirerStub.getCall(0).args[0];
    expect(args.type).to.equal('list');
    expect(args.name).to.equal('timeSelection');
  });

  it('should return the correct time selection value', async () => {
    const result = await reviewRangePrompt(inquirerStub);

    expect(result).to.equal(7);
  });
});
