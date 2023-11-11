import { addQuestion } from './addQuestion.js';
import { getUserQuestionsAll } from './getUserQuestionsAll.js';
import { getUserQuestionsByNum } from './getUserQuestionsByNum.js';
import { getQuestion } from './getQuestion.js';
import { getQuestionData } from './getQuestionData.js';
const QuestModel = {
  addQuestion,
  getQuestion,
  getUserQuestionsAll,
  getUserQuestionsByNum,
  getQuestionData,
};

export default QuestModel;
