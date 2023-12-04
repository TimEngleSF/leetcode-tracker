import { ObjectId } from 'mongodb';

const dummyUsers = {
    main: [
        {
            _id: new ObjectId('65532c3749e74c6155215c5a'),
            username: 'tester',
            displayUsername: 'Tester',
            email: 'test@email.com',
            password: 'password',
            firstName: 'Test',
            lastInit: 'T',
            status: 'verified',
            questions: [],
            groups: ['65623ceb90e702b2ec2fb2e9'],
            admins: [],
            verificationToken: '',
            passwordToken: '',
            lastActivity: new Date('2023-11-25T18:33:21.877Z')
        },
        {
            _id: new ObjectId('65532ce949e74c6155215cf1'),
            username: 'beautifulgirl',
            displayUsername: 'BeautifulGirl',
            email: 'kara@email.com',
            password: 'password',
            firstName: 'Kara',
            lastInit: 'M',
            status: 'verified',
            questions: [],
            groups: ['655a821aefbac1bdace44e68', '65623ceb90e702b2ec2fb2e9'],
            admins: [],
            verificationToken: '',
            passwordToken: '',
            lastActivity: new Date('2023-11-25T18:32:14.598Z')
        },
        {
            _id: new ObjectId('65532dc5b3bfb5f3c362651a'),
            username: 'sm0keman',
            displayUsername: 'Sm0keMan',
            email: 'glen@email.com',
            password: 'password',
            firstName: 'Glen',
            lastInit: 'E',
            status: 'verified',
            questions: [],
            groups: ['65623ceb90e702b2ec2fb2e9', '6562413690e702b2ec2fb2ed'],
            admins: ['65623ceb90e702b2ec2fb2e9'],
            verificationToken: '',
            passwordToken: '',
            lastActivity: new Date('2023-11-25T18:51:03.581Z')
        }
    ],
    withToken: [
        {
            _id: new ObjectId('6554332c78a8ef45d2935f42'),
            username: 'bret',
            displayUsername: 'Bret',
            email: 'bret@email.com',
            password: 'password',
            firstName: 'Bret',
            lastInit: 'A',
            status: 'verified',
            questions: [],
            verificationToken: 'token',
            passwordToken: 'someToken',
            lastActivity: new Date('2023-11-15T02:55:40.197Z'),
            groups: [],
            admins: []
        },
        {
            _id: new ObjectId('655d8af496b7fb90e5f11895'),
            username: 'builder',
            displayUsername: 'builder',
            email: 'timmy@email.com',
            password: 'password',
            firstName: 'Tim',
            lastInit: 'E',
            status: 'pending',
            questions: [],
            verificationToken: 'verificationToken5',
            passwordToken: '',
            lastActivity: new Date('2023-11-22T05:00:36.243Z'),
            admins: [],
            groups: []
        },

        {
            _id: new ObjectId('65601acd16b884a133a856f1'),
            username: 'dad',
            displayUsername: 'dad',
            email: 'dennis@email.com',
            password: 'password',
            firstName: 'Dennis',
            lastInit: 'E',
            status: 'verified',
            groups: ['6560360d8dd40b9bd7503dd8'],
            admins: ['6560360d8dd40b9bd7503dd8'],
            questions: [],
            verificationToken: 'verificationToken4',
            passwordToken: 'token2',
            lastActivity: new Date('2023-11-24T07:39:26.055Z')
        }
    ]
};

export interface DummyUser {
    _id: ObjectId;
    username: string;
    displayUsername: string;
    email: string;
    password: string;
    firstName: string;
    lastInit: string;
    status: string;
    questions: [];
    groups: string[];
    admins: string[];
    verificationToken: string;
    passwordToken: string;
    lastActivity: Date;
}

export interface CreateUserPayload {
    displayUsername: string;
    email: string;
    hashedPass: string;
    firstName: string;
    lastInit: string;
    verificationToken: string;
}

export const getRandomDummyUserIndex = (
    dummyUsersObject: {
        main: DummyUser[];
        withToken: DummyUser[];
    },
    typeOfUser: 'main' | 'withToken'
): number => {
    const max = dummyUsersObject[typeOfUser].length;
    return Math.floor(Math.random() * max);
};

export default dummyUsers;
