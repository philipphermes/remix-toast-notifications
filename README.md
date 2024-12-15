# remix-toast-notifications

![CI](https://github.com/philipphermes/remix-toast-notifications/actions/workflows/ci.yml/badge.svg)
![NPM](https://github.com/philipphermes/remix-toast-notifications/actions/workflows/publish.yml/badge.svg)

Lightweight headless toast notifications in remix

## Setup

> [!TIP]
> If you want an in use example check out [Planning Poker](https://github.com/philipphermes/planning-poker).

### Installation

The first step is to install it in your project with

```sh
npm install remix-toast-notifications
```

### Configuration

#### Create Session

```ts
import {createCookieSessionStorage} from "@remix-run/node";

export const SESSION_KEY_TOASTS = 'toasts'

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "_session",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secrets: [process.env.SECRET ?? ""],
        secure: process.env.NODE_ENV === "production",
    },
});

export const {getSession, commitSession, destroySession} = sessionStorage;
```

#### Create Toast

````ts
export const toast = new Toast(sessionStorage, SESSION_KEY_TOASTS)
````

#### Adjust `root.tsx`

add a loader where you load your toast notifications to be accessible in any component

```ts
export async function loader({request}: LoaderFunctionArgs) {
    const {toasts} = (await toast.retrieve(request))

    return await toast.getDataWithToasts(request, [], toasts)
}
```

### Methods

| method                                            | explanation                                                     |
|---------------------------------------------------|-----------------------------------------------------------------|
| `persist(request, messages)`                      | adds toast messages to session                                  |
| `retrieve(request)`                               | retrives the toast messages from session                        |
| `getDataWithToasts(request, messages, value)`     | returns data() with a given value and adds messages to session  |
| `throwRedirectWithToasts(request, messages, url)` | throws a redirect with a given url and adds messages to session |

### Create Toast Component (Example)

**Dependencies:**
- tailwind
- daisyUI

```tsx
import {useRouteLoaderData} from "@remix-run/react";
import {useEffect, useState} from "react";
import {loader} from "~/root";

export type ToastConfig = {
    time: number;
    fps: number;
}

export default function Toasts({time, fps}: ToastConfig) {
    const toasts = useRouteLoaderData<typeof loader>("root");
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        setProgress(100);

        const progress = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress <= 0) {
                    return 0;
                }
                return prevProgress - (fps / 100);
            });
        }, time / 100 * (fps / 100));

        return () => {
            clearInterval(progress);
        };
    }, [fps, time, toasts]);

    return (
        <div className="fixed bottom-20 left-0 w-full flex flex-col items-center gap-2">
            {toasts && toasts.map((toastMessage, key) =>
                <div
                    key={key}
                    role="alert"
                    className={
                        `alert shadow-lg overflow-hidden w-96 transform transition-all duration-300 ease-out alert-${toastMessage.status}`
                        + (progress > 0 ? " translate-y-0 opacity-100" : " translate-y-10 opacity-0")
                    }
                >
                    <div className="w-full">
                        <span>{toastMessage.message}</span>
                        <progress className="progress progress-accent w-full" value={progress} max="100"></progress>
                    </div>
                </div>
            )}
        </div>
    )
}
```