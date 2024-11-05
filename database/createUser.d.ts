export default function createUser(user: Partial<FasterWebHelperSessionUser> & {
    userName: string;
}): boolean;
