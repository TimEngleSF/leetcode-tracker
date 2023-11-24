import { getCollection } from '../db/connection';
import { injectDb } from './helpers/injectDb';
import { ExtendedError } from '../errors/helpers';
import { AppDocument } from '../types/app-types';

class App {
    private appInfo: AppDocument | null;
    constructor() {
        this.appInfo = null;
    }

    async setAppInfo() {
        const collection = await getCollection<AppDocument>('appInfo');
        const result = await collection
            .find()
            .sort({ created: -1 })
            .limit(1)
            .next();

        this.appInfo = result;
        return this.appInfo;
    }
}

export default App;
