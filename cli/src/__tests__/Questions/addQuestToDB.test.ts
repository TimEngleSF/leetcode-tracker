// import { expect } from 'chai';
// import sinon from 'sinon';
// import addQuestionToDB from '../../Questions/addQuestionToDB.js';

// describe('addQuestToDB', () => {
//   let questPromptStub: any,
//     userJSONStub: any,
//     getHeadersStub: any,
//     axiosStub: any;
//   beforeEach(() => {
//     questPromptStub = sinon.stub();
//     userJSONStub = sinon.stub();
//     getHeadersStub = sinon.stub();
//     axiosStub = sinon.stub();
//   });

//   it('should execute getQuestionsPrompt once', async () => {
//     questPromptStub.resolves({
//       questNum: 1,
//       diff: 0,
//       passed: true,
//       isAddTimeValid: false,
//       speed: null,
//     });
//     userJSONStub.resolves({
//       LC_ID: '123',
//       LC_USERNAME: 'user123',
//     });
//     getHeadersStub.resolves({ Authorization: 'Bearer Token' });
//     axiosStub.resolves({ data: 'some data' });

//     await addQuestionToDB(
//       questPromptStub,
//       userJSONStub,
//       getHeadersStub,
//       axiosStub,
//       true
//     );
//     expect(questPromptStub.calledOnce).to.be.true;
//   });

//   it('should make a successful API call with correct input data', async () => {
//     questPromptStub.resolves({
//       questNum: 1,
//       diff: 0,
//       passed: true,
//       isAddTimeValid: false,
//       speed: null,
//     });

//     userJSONStub.resolves({
//       LC_ID: '123',
//       LC_USERNAME: 'user123',
//     });
//     getHeadersStub.resolves({ Authorization: 'Bearer Token' });
//     axiosStub.resolves({ data: 'some data' });

//     await addQuestionToDB(
//       questPromptStub,
//       userJSONStub,
//       getHeadersStub,
//       axiosStub,
//       true
//     );

//     expect(axiosStub.calledOnce).to.be.true;
//   });

//   it('should handle unauthorized API calls correctly', async () => {
//     questPromptStub.resolves({
//       questNum: 1,
//       diff: 0,
//       passed: true,
//       isAddTimeValid: false,
//       speed: null,
//     });
//     userJSONStub.resolves({
//       LC_ID: '123',
//       LC_USERNAME: 'user123',
//     });
//     getHeadersStub.resolves({ Authorization: 'Invalid Bearer Token' });
//     axiosStub.rejects({ response: { status: 401 }, message: 'Unauthorized' });

//     try {
//       await addQuestionToDB(
//         questPromptStub,
//         userJSONStub,
//         getHeadersStub,
//         axiosStub,
//         true
//       );
//     } catch (error: any) {
//       expect(error.response.status).to.equal(401);
//       expect(axiosStub.calledOnce).to.be.true;
//     }
//   });
// });
