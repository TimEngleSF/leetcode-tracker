import axios from 'axios';
import writeErrorToFile from '../../errors/writeError.js';
import { getAuthHeaders } from '../../utils.js';
import { API_URL } from '../../config.js';
import { QuestionInfo } from '../../Types/api.js';

export const getReviewQuestions = async (
  reviewRangeSelection: { olderThan: number; newerThan: number },
  axiosInstance = axios,
  authHeadersInstance = getAuthHeaders,
  writeErrorInstance = writeErrorToFile
) => {
  try {
    const authHeaders = await authHeadersInstance();
    const { data, status } = (await axiosInstance({
      method: 'GET',
      url: `${API_URL}/questions/review`,
      headers: authHeaders,
      data: reviewRangeSelection,
    })) as { data: QuestionInfo[]; status: number };
    if (status === 200) {
      return data.sort((a, b) => a.questId - b.questId);
    } else {
      return false;
    }
  } catch (error: any) {
    await writeErrorInstance(
      error,
      'Error arrised while executing generalLeaderBoard function'
    );
  }
};
