import { getPackageVersion } from './utils.js';

export let API_URL = 'http://44.227.144.103';
export let LATEST_VERSION = process.env.npm_package_version;

export const setLatestVersion = async () => {
    const actualLatestVersion = await getPackageVersion();
    try {
        if (actualLatestVersion !== LATEST_VERSION) {
            LATEST_VERSION = actualLatestVersion;
        }
    } catch (error) {
        return;
    }
};
