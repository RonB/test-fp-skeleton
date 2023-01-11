import { describe, test, expect } from 'vitest';

import { User } from '$lib/server/models';
import { find } from '$lib/server/factory';

describe("Factory", () => {
    test("Find users", async () => {
        let users = await find(User)
        expect(users[0].data.model).toBe('User');
    });
    // test("Find users", async () => {
    //     let users: any = await fetch('/api/test');
    //     expect(users[0].data.model).toBe('User');
    // })
});