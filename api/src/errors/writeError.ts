import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const writeErrorToFile = async (error: any, extraInfo = '') => {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const logFilePath = path.join(__dirname, 'error_log.json');

  const errorObject = {
    errorMessage: error.message,
    errorStack: error.stack,
    time: new Date().toISOString(),
    extraInfo,
  };

  try {
    await fs.access(logFilePath);
  } catch (e) {
    await fs.writeFile(logFilePath, JSON.stringify([]));
  }

  const existingErrors = JSON.parse(await fs.readFile(logFilePath, 'utf-8'));

  existingErrors.push(errorObject);

  await fs.writeFile(logFilePath, JSON.stringify(existingErrors, null, 2));
};

export default writeErrorToFile;
