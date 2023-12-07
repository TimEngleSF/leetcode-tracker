import { Document, ObjectId } from 'mongodb';

export interface AnswerDocument extends Document {
    _id: ObjectId;
    questId: ObjectId;
    userId: ObjectId;
    name: string;
    code: string;
    created: Date;
}
