import { Collection, Db, Document } from 'mongodb';

export const injectDb = <T extends Document>(
    db: Db,
    collectionName:
        | 'users'
        | 'blacklistTokens'
        | 'questions'
        | 'questionData'
        | 'groups'
): Collection<T> => {
    return db.collection<T>(collectionName);
};
