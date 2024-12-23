import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UserService {
    private readonly users: User[];

    constructor() {
        this.users = [
            {
                userId: 1,
                username: 'chew',
                password: 'abcd1234',
            },
            {
                userId: 2,
                username: 'shin',
                password: 'abcd1234',
            },
            {
                userId: 3,
                username: 'roy',
                password: 'ilovedaikin',
            },
            {
                userId: 4,
                username: 'alex',
                password: 'abcd123',
            },
            {
                userId: 5,
                username: 'wz',
                password: 'abcd123',
            },
            {
                userId: 6,
                username: 'cy',
                password: 'abcd123',
            },
        ];
    }

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }
}
