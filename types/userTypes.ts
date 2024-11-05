
declare global {
  export interface FasterWebHelperSessionUser {
    userName: string
    fasterWebUserName?: string
    emailAddress?: string
    userKeyGuid: string
    settings: Record<string, string | null>
  }
}

declare module 'express-session' {
  interface Session {
    user?: FasterWebHelperSessionUser
  }
}
