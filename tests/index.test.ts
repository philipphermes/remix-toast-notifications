import {describe, expect, it} from "vitest";
import {createCookieSessionStorage} from "@remix-run/node";
import {Toast} from "../src";

describe('index', () => {
    it('can add toast messages and can retrieve them', async () => {
        const sessionStorage = createCookieSessionStorage({
            cookie: {
                name: "_session",
                sameSite: "lax",
                path: "/",
                httpOnly: true,
                secure: false,
            },
        });

        const toast = new Toast(sessionStorage, 'toasts')

        const request = new Request('http://localhost');

        const session = await toast.persist(request, [
            {
                message: "Test 1",
                status: "success",
            },
            {
                message: "Test 2",
                status: "warning",
            }
        ])

        request.headers.set("cookie", await sessionStorage.commitSession(session));

        const {toasts} = await toast.retrieve(request)

        expect(toasts.length).toBe(2)
    })

    it('can get data with toasts', async () => {
        const sessionStorage = createCookieSessionStorage({
            cookie: {
                name: "_session",
                sameSite: "lax",
                path: "/",
                httpOnly: true,
                secure: false,
            },
        });

        const toast = new Toast(sessionStorage, 'toasts')

        const request = new Request('http://localhost');

        const data = await toast.getDataWithToasts(request, [
            {
                message: "Test 1",
                status: "success",
            },
            {
                message: "Test 2",
                status: "warning",
            }
        ], {test: 'test'})

        expect(data.data.test).toBe('test')
    })

    it('can get data with single toast', async () => {
        const sessionStorage = createCookieSessionStorage({
            cookie: {
                name: "_session",
                sameSite: "lax",
                path: "/",
                httpOnly: true,
                secure: false,
            },
        });

        const toast = new Toast(sessionStorage, 'toasts')

        const request = new Request('http://localhost');

        const data = await toast.getDataWithToasts(request, {
            message: "Test 1",
            status: "success",
        },
        {test: 'test'})

        expect(data.data.test).toBe('test')
    })

    it('can throw redirect with toasts', async () => {
        const sessionStorage = createCookieSessionStorage({
            cookie: {
                name: "_session",
                sameSite: "lax",
                path: "/",
                httpOnly: true,
                secure: false,
            },
        });

        const toast = new Toast(sessionStorage, 'toasts')

        const request = new Request('http://localhost');

        try {
            await toast.throwRedirectWithToasts(request, [
                {
                    message: "Test 1",
                    status: "success",
                },
                {
                    message: "Test 2",
                    status: "warning",
                }
            ], '/test')
        } catch (redirect) {
            expect(redirect.headers.get('location')).toBe('/test')
        }
    })

    it('can throw redirect with single toast', async () => {
        const sessionStorage = createCookieSessionStorage({
            cookie: {
                name: "_session",
                sameSite: "lax",
                path: "/",
                httpOnly: true,
                secure: false,
            },
        });

        const toast = new Toast(sessionStorage, 'toasts')

        const request = new Request('http://localhost');

        try {
            await toast.throwRedirectWithToasts(request, {
                message: "Test 1",
                status: "success",
            }, '/test')
        } catch (redirect) {
            expect(redirect.headers.get('location')).toBe('/test')
        }
    })
})