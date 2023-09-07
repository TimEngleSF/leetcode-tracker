import fs from 'fs/promises';
import path from 'path';
import url from 'url';

let userData: {
  LC_USERNAME: string;
  LC_ID: string;
  LC_TOKEN: string;
  LC_FIRSTNAME: string;
  LC_LASTINIT: string;
};

const getUserLocalData = async () => {
  if (userData) {
    return userData;
  }
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const data = (
    await fs.readFile(path.join(__dirname, 'user.json'))
  ).toString();

  const userObject = JSON.parse(data);
  userData = userObject;
  return userData;
};

export default getUserLocalData;
