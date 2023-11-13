import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '../../db/connection.js';
import { QuestionDocument } from '../../types/questionTypes.js';

export const convertDaysToMillis = (days: number): number =>
  days * 24 * 60 * 60 * 1000;
