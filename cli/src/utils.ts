import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import readline from 'readline';
import chalk from 'chalk';
import figlet from 'figlet';
import axios from 'axios';
import { API_URL, LATEST_VERSION } from './config.js';
import { UserObject } from './Types/user.js';
import { AppInfo, Group, UserLoginResult } from './Types/api.js';
import inquirer from 'inquirer';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'user.json');
let updateMessage: string | null;

export const getUserJSON = async (): Promise<UserObject> => {
    try {
        await fs.access(path.join(__dirname, 'user.json'));
    } catch (error) {
        const payload = JSON.stringify({
            LC_USERNAME: '',
            LC_DISPLAYNAME: '',
            LC_ID: '',
            LC_TOKEN: '',
            LC_FIRSTNAME: '',
            LC_LASTINIT: '',
            LC_GROUPS: [],
            LC_ADMINS: []
        });
        await fs.writeFile(path.join(__dirname, 'user.json'), payload);
    }
    const data = (
        await fs.readFile(path.join(__dirname, 'user.json'))
    ).toString();

    const userObject = JSON.parse(data);

    return userObject;
};

export const addGroupToJSON = async (groupId: string) => {
    try {
        const jsonPath = path.join(__dirname, 'user.json');
        const userData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
        if (userData.LC_GROUPS.includes(groupId)) {
            return;
        }
        userData.LC_GROUPS.push(groupId);

        await fs.writeFile(jsonPath, JSON.stringify(userData));
    } catch (error) {
        console.log(error);
    }
};

export const addAdminToJSON = async (groupId: string) => {
    try {
        const jsonPath = path.join(__dirname, 'user.json');
        const userData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
        if (userData.LC_ADMINS.includes(groupId)) {
            return;
        }
        userData.LC_ADMINS.push(groupId);

        await fs.writeFile(jsonPath, JSON.stringify(userData));
    } catch (error) {
        console.log(error);
    }
};

export const localGroupsArray = async (): Promise<string[]> => {
    const userData = await JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
    return userData.LC_GROUPS as string[];
};

export const localAdminsArray = async (): Promise<string[]> => {
    const userData = await JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
    return userData.LC_ADMINS as string[];
};

export const getPackageVersion = async () => {
    try {
        const url = `https://registry.npmjs.org/lc-tracker`;
        const response = await axios.get(url);
        const version = response.data['dist-tags'].latest;
        // console.log(`Latest version of ${packageName} is: ${version}`);
        return version;
    } catch (error) {
        console.error('Error fetching package version:', error);
    }
};

export const getAuthHeaders = async (): Promise<{
    Authorization: string;
}> => {
    const { LC_TOKEN } = await getUserJSON();
    return { Authorization: `Bearer ${LC_TOKEN}` };
};

export const printHeader = () => {
    const currVersion = process.env.npm_package_version;
    let versionPrintInfo: string;
    if (currVersion === LATEST_VERSION) {
        versionPrintInfo = `v${LATEST_VERSION}`;
    } else {
        versionPrintInfo = `You are running ${chalk.red(
            'v' + currVersion
        )}, please update to current version ${chalk.green(
            'v' + LATEST_VERSION
        )}\nRun: 'npm i -g lc-tracker' to update`;
    }
    console.log(chalk.cyan(figlet.textSync('LeetCode Tracker')));
    console.log(versionPrintInfo);
    updateMessage && console.log(chalk.bgRed(updateMessage));
    console.log('\n');
};

export const clearPrevLine = () => {
    readline.moveCursor(process.stdout, 0, -1);

    readline.clearLine(process.stdout, 0);

    readline.cursorTo(process.stdout, 0);
};

export const logout = async () => {
    const payload = {
        LC_USERNAME: null,
        LC_ID: null,
        LC_TOKEN: null,
        LC_FIRSTNAME: null,
        LC_LASTINIT: null,
        LC_GROUPS: [],
        LC_ADMINS: []
    };

    const payloadString = JSON.stringify(payload, null, 2);

    await fs.writeFile(path.join(__dirname, 'user.json'), payloadString);
    return payload;
};

export const fetchUserData = async (userID: string) => {
    const authHeaders = await getAuthHeaders();
    const { data } = await axios({
        method: 'GET',
        url: `${API_URL}/users/${userID}`,
        headers: authHeaders
    });
    return data;
};

export const fetchQuestionInfo = async (
    questNum: number,
    axiosInstance: any = axios,
    getAuthHeadersFunc: any = getAuthHeaders
) => {
    const authHeaders = await getAuthHeadersFunc();
    const { data } = await axiosInstance({
        method: 'GET',
        url: `${API_URL}/questions/lc-info/${questNum}`,
        headers: authHeaders
    });
    return data;
};

export const fetchUserStatus = async (
    userObject: UserObject
): Promise<{ status: number; appInfo: AppInfo }> => {
    try {
        const { status, data } = await axios({
            method: 'GET',
            url: `${API_URL}/status`,
            headers: { Authorization: `Bearer ${userObject.LC_TOKEN}` }
        });
        return { status, appInfo: data.appInfo };
    } catch (error: any) {
        if (error.response.status === 422) {
            throw new Error('Please verify your account.');
        }
        throw new Error(
            `There was an error fetching user account: ${error.response.data}`
        );
    }
};

export const isLoggedIn = async () => {
    const userObject = await getUserJSON();
    if (!userObject.LC_TOKEN) {
        return false;
    }
    try {
        // const { status, data } = await axios({
        //     method: 'GET',
        //     url: `${API_URL}/status`,
        //     headers: { Authorization: `Bearer ${userObject.LC_TOKEN}` }
        // });
        const { status, appInfo } = await fetchUserStatus(userObject);

        const userData = await axios.get(
            `${API_URL}/users/${userObject.LC_ID}`,
            {
                headers: await getAuthHeaders()
            }
        );

        updateMessage = appInfo.messages.updateMessages.cli;

        const jsonPath = path.join(__dirname, 'user.json');
        const localUserData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
        await fs.writeFile(
            jsonPath,
            JSON.stringify({
                ...localUserData,
                LC_GROUPS: userData.data.groups
            })
        );
        if (status !== 200) {
            return false;
        }
    } catch (error) {
        return false;
    }

    return true;
};

export const fetchGroups = async (): Promise<Omit<Group, 'passCode'>[]> => {
    try {
        const { data } = await axios.get(`${API_URL}/group`, {
            headers: await getAuthHeaders()
        });
        return data as Omit<Group, 'passCode'>[];
    } catch (error: any) {
        throw new Error(`Error fetching groups: ${error.message}`);
    }
};

export const fetchUserGroups = async () => {
    // Get groups that the user belongs to
    const { LC_GROUPS } = await getUserJSON();
    // fetch all group documents from API
    const fetchedGroups = await fetchGroups();
    // Include only groups that the user belongs to
    const filteredGroups = fetchedGroups.filter((group) =>
        LC_GROUPS.includes(group._id)
    );
    return filteredGroups;
};

export const fetchUserAdminGroups = async () => {
    const { LC_ADMINS } = await getUserJSON();
    const fetchedGroups = await fetchGroups();
    const filteredGroups = fetchedGroups.filter((group) =>
        LC_ADMINS.includes(group._id)
    );
    return filteredGroups;
};

export const joinGroup = async (groupId: string, passCode?: string) => {
    await axios({
        method: 'POST',
        url: `${API_URL}/group/add-member`,
        headers: await getAuthHeaders(),
        data: { groupId, passCode: passCode?.toLowerCase() }
    });
};

export const postLoginUser = async ({
    email,
    password
}: {
    email: string;
    password: string;
}): Promise<UserLoginResult> => {
    const { data } = await axios({
        method: 'POST',
        url: `${API_URL}/login`,
        headers: { 'Content-Type': 'application/json' },
        data: { email, password }
    });
    return data;
};

export interface MembersInfo {
    _id: string;
    firstName: string;
    lastInit: string;
    username: string;
    lastActivity: string;
}
export const getGroupMembers = async (
    groupId: string
): Promise<MembersInfo[]> => {
    const { Authorization } = await getAuthHeaders();
    const { data } = await axios({
        method: 'GET',
        url: `${API_URL}/group/members`,
        headers: { Authorization, 'Content-Type': 'application/json' },
        data: { groupId }
    });

    return data;
};

export const tryAgainPrompt = async (): Promise<boolean> => {
    const { tryAgain } = await inquirer.prompt({
        type: 'confirm',
        name: 'tryAgain',
        message: 'Would you like to try again?'
    });
    return tryAgain;
};

export const continuePrompt = async () => {
    await inquirer.prompt({
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
    });
};
