import { User, Session, Account } from '$lib/server/models'
import type { SessionType } from '$lib/types'
import { findOne, create, read, remove, update } from '$lib/server/factory'

export const AuthenticationAdapter = {
    createUser: async (rawData: any) => {
        const data = {
            name: rawData.name,
            image: rawData.image,
            email: rawData.email,
            email_verified: rawData.emailVerified ? true : false
        }
        const user: User = await create(User, data)
        return user.data;
    },
    getUser: async (id: string) => {
        return await findOne(User, { select: id })
    },
    getUserByEmail: async (email: string) => {
        return await findOne(User, { where: { field: 'email', value: email } })
    },
    getUserByAccount: async (provider_providerAccountId: any) => {
        const account = await findOne(Account, {
            select: '*, userId as User',
            fetch: 'User',
            where: [{
                field: 'providerAccountId',
                value: provider_providerAccountId.providerAccountId
            }],
        })
        return account ? account.User : null
    },
    updateUser: async (data: any) => {
        const user = await read(User, data.id);
        user.update(data)
    },
    deleteUser: async (id: string) => {
        return await remove(User, id);
    },
    linkAccount: async (data: any) => {
        return await create(Account, data);
    },
    unlinkAccount: async (providerAccountId: string) => {
        const account = await findOne(Account, { where: { field: 'providerAccountId', value: providerAccountId } })
        return await remove(Account, account.data.id)
    },
    getSessionAndUser: async (sessionToken: string) => {
        const userSession = await findOne(Session, {
            select: '*, userId as User ',
            where: { field: 'sessionToken', value: sessionToken },
            fetch: 'User'
        })
        return userSession ? { user: userSession.User, session: userSession } : null
    },
    createSession: async (data: SessionType) => {
        const session = await create(Session, data);
        return session.data;
    },
    updateSession: async (data: SessionType) => {
        const session = await read(Session, data.id);
        await update(session, { "sessionToken": data.sessionToken });
    },
    deleteSession: async (sessionToken: string) => {
        const session: SessionType = await findOne(Session, { where: { field: 'sessionToken', value: sessionToken } })
        if (session.id) remove(Session, session.id)
        return;
    },
    createVerificationToken: (data: any) => {
        return 'know id what to do here'
    },
    useVerificationToken: async (identifier_token: string) => {
        // try {
        //     return await p.verificationToken.delete({ where: { identifier_token } })
        // } catch (error) {
        //     // If token already used/deleted, just return null
        //     // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        //     if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
        //         return null
        //     throw error
        // }
    },


}

// to be used as configuration for the CredentialsProvider
import { trpc } from "$lib/trpc/routers/AppRouter";
import type { CredentialsType } from '$lib/types'
export const credentials = {
    credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" }
    },
    async authorize(credentials: CredentialsType) {
        const user = await trpc({}).User.login({ email: credentials.email, password: credentials.password })
        return user ? user : null;
    }
}

import { decode } from '@auth/core/jwt';
import { AUTH_SECRET } from "$env/static/private";
export const sessionHandle = async ({ event, resolve }: any) => {
    const sessionToken = event.cookies.get('next-auth.session-token');
    if (sessionToken) {
        let session_and_user = await AuthenticationAdapter.getSessionAndUser(sessionToken);
        if (!session_and_user) {
            // test if there is an empty session for this user. 
            // This session and could be created by the credentials provider.
            // Unfortunaltely this is necessary because the Auth.js package
            // does not persist in the database, in that case update that session.
            const decoded: any = await decode({ token: sessionToken, secret: AUTH_SECRET });
            // locate empty session object
            let session: SessionType = await findOne(Session, { where: [{ field: 'userId', value: decoded.sub }, { field: 'sessionToken', value: '' }] })
            if (session) {
                const s: Session = await read(Session, session.id);
                // update the session with the jwt token
                await s.update({ sessionToken: sessionToken })
            }
            session_and_user = await AuthenticationAdapter.getSessionAndUser(sessionToken);
        }
    }
    return await resolve(event);
}