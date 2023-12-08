import { Document, ObjectId } from 'mongodb';

export interface AnswerDocument extends Document {
    _id: ObjectId;
    questId: ObjectId;
    userId: ObjectId;
    name: string;
    code: string;
    created: Date;
}

export interface AnswerListEntry extends Document {
    name: string;
    code: string;
    created: Date;
    language: string;
    passed: boolean;
    speed?: number | undefined;
}
