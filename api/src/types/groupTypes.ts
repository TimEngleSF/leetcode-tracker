import { Document, ObjectId } from 'mongodb';

export interface GroupDocument extends Document {
    _id: ObjectId;
    name: string;
    displayName: string;
    members: ObjectId[];
    admins: ObjectId[];
    featuredQuestion?: number | null;
    passCode: string | null;
    open: boolean;
}

export interface GroupCreateInput {
    adminId: ObjectId | string;
    name: string;
    open: boolean;
    passCode: string | null;
}

export interface GroupAssignInput {
    _id: ObjectId | string;
}

export type GroupKeys = '_id' | 'name' | 'questionOfDay' | 'questionOfWeek';
