import { expect } from 'chai';
import sinon from 'sinon';
import addQuestionToDB from '../Questions/addQuestionToDB.js';

describe('addQuestToDB', () => {
  const questPromptStub = sinon.stub();
  const userJSONStub = sinon.stub();
  const getHeadersStub = sinon.stub();
  const axiosStub: any = sinon.stub();
  beforeEach(() => {
    userJSONStub.reset();
    questPromptStub.reset();
    getHeadersStub.reset();
    axiosStub.reset();
  });

  it('should execute getQuestionsPrompt once', async () => {
    questPromptStub.resolves({
      questNum: 1,
      diff: 0,
      passed: true,
      isAddTimeValid: false,
      speed: null,
    });
    userJSONStub.resolves({
      LC_ID: '123',
      LC_USERNAME: 'user123',
    });
    getHeadersStub.resolves({ Authorization: 'Bearer Token' });
    axiosStub.resolves({ data: 'some data' });

    await addQuestionToDB(
      questPromptStub,
      userJSONStub,
      getHeadersStub,
      axiosStub,
      true
    );
    expect(questPromptStub.calledOnce).to.be.true;
  });

  it('should make a successful API call with correct input data', async () => {
    questPromptStub.resolves({
      questNum: 1,
      diff: 0,
      passed: true,
      isAddTimeValid: false,
      speed: null,
    });

    userJSONStub.resolves({
      LC_ID: '123',
      LC_USERNAME: 'user123',
    });
    getHeadersStub.resolves({ Authorization: 'Bearer Token' });
    axiosStub.resolves({ data: 'some data' });

    await addQuestionToDB(
      questPromptStub,
      userJSONStub,
      getHeadersStub,
      axiosStub,
      true
    );

    expect(axiosStub.calledOnce).to.be.true;
  });

  it('should handle unauthorized API calls correctly', async () => {
    questPromptStub.resolves({
      questNum: 1,
      diff: 0,
      passed: true,
      isAddTimeValid: false,
      speed: null,
    });
    userJSONStub.resolves({
      LC_ID: '123',
      LC_USERNAME: 'user123',
    });
    getHeadersStub.resolves({ Authorization: 'Invalid Bearer Token' });
    axiosStub.rejects({ response: { status: 401 }, message: 'Unauthorized' });

    try {
      await addQuestionToDB(
        questPromptStub,
        userJSONStub,
        getHeadersStub,
        axiosStub,
        true
      );
    } catch (error: any) {
      expect(error.response.status).to.equal(401);
      expect(axiosStub.calledOnce).to.be.true;
    }
  });
});
