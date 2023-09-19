import { expect } from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import { generalLeaderboard } from '../../Leaderboard/generalLeaderboard.js';

describe('generalLeaderboard', () => {
  let axiosStub: any;
  let getAuthHeadersStub: any;
  let writeErrorToFileStub: any;
  let consoleLogStub: any;

  beforeEach(() => {
    axiosStub = sinon.stub(axios, 'request').resolves({
      data: {
        leaderboardData: [
          {
            userID: '64f9639df35d2e28a21df3a4',
            name: 'Test T.',
            passedCount: 58,
            lastActivity: 1695149016969,
          },
          {
            userID: '64f6f6d919a5c70e704b1942',
            name: 'Tim E.',
            passedCount: 14,
            lastActivity: 1695148813991,
          },
        ],
        userData: {
          userId: '64f9639df35d2e28a21df3a4',
          name: 'Test T',
          passedCount: 58,
          rank: 1,
        },
      },
    });

    getAuthHeadersStub = sinon.stub().resolves({
      Authorization: 'Bearer example_token',
    });

    writeErrorToFileStub = sinon.stub();
    consoleLogStub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should make a request to the leaderboard API', async () => {
    await generalLeaderboard(
      getAuthHeadersStub,
      axiosStub,
      writeErrorToFileStub
    );
    expect(axiosStub.calledOnce).to.be.true;
  });

  it('should get the authentication headers', async () => {
    await generalLeaderboard(
      getAuthHeadersStub,
      axiosStub,
      writeErrorToFileStub
    );
    expect(getAuthHeadersStub.calledOnce).to.be.true;
  });

  it('should write error to file if an error occurs', async () => {
    axiosStub.rejects(new Error('API error'));
    await generalLeaderboard(
      getAuthHeadersStub,
      axiosStub,
      writeErrorToFileStub
    );
    expect(writeErrorToFileStub.calledOnce).to.be.true;
  });
});
