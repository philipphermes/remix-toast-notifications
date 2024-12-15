import {data, redirect, type SessionStorage} from "@remix-run/node";

export type ToastMessage = {
    message: string;
    status: 'success' | 'error' | 'info' | 'warning';
}

export class Toast {
    constructor(
        private readonly sessionStorage: SessionStorage,
        private readonly sessionKey: string,
    ) {
    }

    async persist(request: Request, messages: ToastMessage|ToastMessage[])
    {
        if (!(messages instanceof Array)) {
            messages = [messages]
        }

        const session = await this.sessionStorage.getSession(request.headers.get("cookie"))
        session.set(this.sessionKey, messages);

        return session;
    }

    async retrieve(request: Request) {
        const session = await this.sessionStorage.getSession(request.headers.get("cookie"))
        const toasts = session.get(this.sessionKey) ?? [];

        return {
            session,
            toasts
        }
    }

    async getDataWithToasts<T>(request: Request, messages: ToastMessage|ToastMessage[], value: T) {
        const session = await this.persist(request, messages)

        return data(value, {
            headers: {
                "Set-Cookie": await this.sessionStorage.commitSession(session)
            }
        })
    }

    async throwRedirectWithToasts(request: Request, messages: ToastMessage|ToastMessage[], url: string) {
        const session = await this.persist(request, messages)

        throw redirect(url, {
            headers: {
                "Set-Cookie": await this.sessionStorage.commitSession(session)
            }
        })
    }
}