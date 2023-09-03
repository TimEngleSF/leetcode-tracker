var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import connectDb from '../../db/connection.js';
let usersCollection;
const getCollection = () => __awaiter(void 0, void 0, void 0, function* () {
    if (usersCollection) {
        return usersCollection;
    }
    const db = yield connectDb();
    return (usersCollection = db.collection('users'));
});
getCollection();
const userExists = (target) => __awaiter(void 0, void 0, void 0, function* () {
    return yield usersCollection.findOne({ username: target });
});
const registerUser = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, firstName, lastInit, yob, password } = body;
    console.log(yield userExists(username));
    if (yield userExists(username)) {
        return {
            code: 400,
            data: { message: `The username ${username} is already in use` },
        };
    }
    try {
        const result = yield usersCollection.insertOne({
            username,
            firstName,
            lastInit,
            yob,
            password,
        });
        return { code: 201, data: result };
    }
    catch (error) {
        return { code: 400, data: { message: 'There was an error' } };
    }
});
export default registerUser;
