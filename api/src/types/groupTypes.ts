import { Document, ObjectId } from 'mongodb';

export interface GroupDocument extends Document {
    _id: ObjectId;
    name: string;
    displayName: string;
    members: ObjectId[];
    admins: ObjectId[];
    questionOfDay?: ObjectId | null;
    questionOfWeek?: ObjectId | null;
    passCode: string;
}
