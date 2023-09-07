import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const writeErrorToFile = async (error: any, extraInfo = '') => {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const logFilePath = path.join(__dirname, 'error_log.json');

  // Create an object to store the error and any extra information
  const errorObject = {
    errorMessage: error.message,
    errorStack: error.stack,
    time: new Date().toISOString(),
    extraInfo,
  };

  try {
    // Check if the file already exists
    await fs.access(logFilePath);
  } catch (e) {
    // If the file doesn't exist, create it and write an initial empty array
    await fs.writeFile(logFilePath, JSON.stringify([]));
  }

  // Read the existing errors from the file
  const existingErrors = JSON.parse(await fs.readFile(logFilePath, 'utf-8'));

  // Add the new error to the array
  existingErrors.push(errorObject);

  // Write the updated errors back to the file
  await fs.writeFile(logFilePath, JSON.stringify(existingErrors, null, 2));
};

export default writeErrorToFile;
