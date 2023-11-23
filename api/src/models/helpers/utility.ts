import { ObjectId } from 'mongodb';

export const sanitizeId = (_id: string | ObjectId): ObjectId => {
    if (typeof _id === 'string') {
        _id = new ObjectId(_id);
    }
    return _id;
};
