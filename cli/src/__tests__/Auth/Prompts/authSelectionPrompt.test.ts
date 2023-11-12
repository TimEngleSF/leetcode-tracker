import { expect } from 'chai';
import sinon from 'sinon';
import authSelectionPrompt from '../../../Auth/Prompts/authSelectionPrompt.js';
import { isLoggedIn } from '../../../utils.js';

describe('authSelectionPrompt', () => {
  let promptStub: any, getUserJSONStub: any, isLoggedInStub: any;

  beforeEach(() => {
    promptStub = sinon.stub();
    getUserJSONStub = sinon.stub();
    isLoggedInStub = sinon.stub();
  });

  it('should prompt for login if user is not logged in and chooses Login', async () => {
    getUserJSONStub.resolves({
      LC_USERNAME: null,
      LC_ID: null,
      LC_TOKEN: null,
    });
    promptStub.resolves({ authSelect: 'login' });

    const result = await authSelectionPrompt(promptStub, getUserJSONStub);
    console.log(result);
    expect(result).to.equal('login');
    expect(promptStub.calledOnce).to.be.true;
  });

  it('should prompt for registration if user is not logged in and chooses Register', async () => {
    getUserJSONStub.resolves({
      LC_USERNAME: null,
      LC_ID: null,
      LC_TOKEN: null,
    });
    promptStub.resolves({ authSelect: 'register' });

    const result = await authSelectionPrompt(promptStub, getUserJSONStub);

    expect(result).to.equal('register');
    expect(promptStub.calledOnce).to.be.true;
  });

  it('should not prompt if user is already logged in', async () => {
    getUserJSONStub.resolves({
      LC_USERNAME: 'username',
      LC_ID: 'id',
      LC_TOKEN: 'token',
    });

    isLoggedInStub.resolves(true);

    const result = await authSelectionPrompt(
      promptStub,
      getUserJSONStub,
      isLoggedInStub
    );

    expect(result).to.be.false;
    expect(promptStub.called).to.be.false;
  });
});
