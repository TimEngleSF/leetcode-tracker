import axios from 'axios';
import writeErrorToFile from '../../errors/writeError.js';
import { getAuthHeaders } from '../../utils.js';
import { API_URL } from '../../apiConfigInit.js';

export const getReviewQuestions = async (
  reviewRangeSelection: { olderThan: number; newerThan: number },
  axiosInstance = axios,
  authHeadersInstance = getAuthHeaders,
  writeErrorInstance = writeErrorToFile
) => {
  try {
    const authHeaders = await authHeadersInstance();
    const { data, status } = await axiosInstance({
      method: 'GET',
      url: `${API_URL}/review`,
      headers: authHeaders,
      data: reviewRangeSelection,
    });
    if (status === 200) {
      return data;
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
