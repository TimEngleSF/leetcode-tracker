import { Document, ObjectId } from 'mongodb';

export interface AppDocument extends Document {
    _id: ObjectId;
    messages: { updateMessage: string };
    cliInfo: { version: string; lastUpdated: string };
    apiInfo: { version: string; lastUpdated: string };
    created: Date;
}
