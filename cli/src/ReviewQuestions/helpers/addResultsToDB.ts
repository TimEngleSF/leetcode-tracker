import axios from 'axios';
import { getAuthHeaders, getUserJSON } from '../../utils.js';
import writeErrorToFile from '../../errors/writeError.js';
import { API_URL } from '../../config.js';

export const addResultsToDB = async (
  questNum: number,
  results: { passed: boolean; speed: number | null },
  axiosInstance = axios,
  authHeadersInstance = getAuthHeaders,
  getUserJSONInstance = getUserJSON,
  writeErrorInstance = writeErrorToFile
) => {
  try {
    const { passed, speed } = results;
    const authHeaders = await authHeadersInstance();
    const userJSON = await getUserJSONInstance();
    const payload = {
      userId: userJSON.LC_ID,
      username: userJSON.LC_USERNAME,
      questNum,
      passed,
      speed,
    };

    const { data } = await axiosInstance({
      method: 'POST',
      url: `${API_URL}/questions/add`,
      headers: authHeaders,
      data: payload,
    });

    return data.acknowledged;
  } catch (error: any) {
    try {
      await writeErrorInstance(
        error,
        'Error originated from reviewQuestions/helpers/addResultsToDB'
      );
    } catch (error) {
      console.log(
        'There was an error writing request Error when posting question results to Database'
      );
    }
  }
};
