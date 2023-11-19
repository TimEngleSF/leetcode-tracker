import { expect } from 'chai';
import sinon from 'sinon';
import { getReviewQuestions } from '../../../ReviewQuestions/helpers/getReviewQuestions.js';
// import testVars from '../../testVariables.js';

describe('getReviewQuestions', () => {
  let axiosStub: any;
  let authHeadersStub: any;
  let writeErrorStub: any;

  beforeEach(() => {
    axiosStub = sinon.stub().resolves({
      data: [
        {
          _id: '64ff67ebdf188afbd9d2f86c',
          questId: 22,
          title: 'Generate Parentheses',
          url: 'https://leetcode.com/problems/generate-parentheses/',
          diff: 'Medium',
        },
      ],
      status: 200,
    });

    authHeadersStub = sinon.stub().resolves({
      Authorization: `Bearer sometokenofsorts`,
    });

    writeErrorStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should make a request to the review API with the correct data', async () => {
    const reviewRangeSelection = { olderThan: 7, newerThan: 3 };
    const data = await getReviewQuestions(
      reviewRangeSelection,
      axiosStub,
      authHeadersStub,
      writeErrorStub
    );

    expect(axiosStub.calledOnce).to.be.true;
    const axiosArgs = axiosStub.getCall(0).args[0];
    expect(axiosArgs.method).to.equal('GET');
    expect(axiosArgs.url).to.equal('http://localhost:3000/review');
    expect(axiosArgs.data).to.deep.equal(reviewRangeSelection);
    expect(axiosArgs.headers.Authorization).to.equal(`Bearer sometokenofsorts`);
    expect(data).to.deep.equal([
      {
        _id: '64ff67ebdf188afbd9d2f86c',
        questId: 22,
        title: 'Generate Parentheses',
        url: 'https://leetcode.com/problems/generate-parentheses/',
        diff: 'Medium',
      },
    ]);
  });

  it('should handle API error gracefully', async () => {
    axiosStub.rejects(new Error('API error'));
    await getReviewQuestions(
      { olderThan: 7, newerThan: 0 },
      axiosStub,
      authHeadersStub,
      writeErrorStub
    );

    expect(writeErrorStub.calledOnce).to.be.true;
  });

  it('should return false for status codes other than 200', async () => {
    axiosStub.resolves({ status: 404 });
    const result = await getReviewQuestions(
      { olderThan: 7, newerThan: 3 },
      axiosStub,
      authHeadersStub,
      writeErrorStub
    );
    expect(result).to.equal(false);
  });

  it('should get the authentication headers', async () => {
    await getReviewQuestions(
      { olderThan: 7, newerThan: 3 },
      axiosStub,
      authHeadersStub,
      writeErrorStub
    );
    expect(authHeadersStub.calledOnce).to.be.true;
  });

  it('should call writeErrorInstance with correct arguments if an error occurs', async () => {
    const error = new Error('API error');
    axiosStub.rejects(error);
    await getReviewQuestions(
      { olderThan: 7, newerThan: 3 },
      axiosStub,
      authHeadersStub,
      writeErrorStub
    );

    expect(writeErrorStub.calledOnce).to.be.true;
    expect(
      writeErrorStub.calledWith(
        error,
        'Error arrised while executing generalLeaderBoard function'
      )
    ).to.be.true;
  });
});
