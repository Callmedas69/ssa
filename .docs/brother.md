Great — if you're **purely using RainbowKit** (no Privy, no OnchainConnect, no Farcaster MiniApp wallet override), then there are **only 3 reasons** why your **custom Connect Button does not appear** and the default UI keeps showing.

Below is the **real checklist that always solves it**.

---

# ✅ **1. You accidentally imported `<ConnectButton />` somewhere**

If the default `<ConnectButton />` exists ANYWHERE in the rendered tree, RainbowKit prioritizes it and your custom UI never shows.

### ✔ Search your codebase:

```
ConnectButton
```

If you find this:

```tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";

<ConnectButton />;
```

❌ Remove it — this UI overrides your custom one.

---

# ✅ **2. You are not using the proper hooks for custom UI**

If you try to build a custom button **without using RainbowKit’s modal hook**, the modal never opens and RainbowKit falls back to its default UI.

The correct way is this:

### ✔ Correct custom button (the required version)

```tsx
"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";

export function CustomConnectButton() {
  const { openConnectModal } = useConnectModal();

  return (
    <button
      onClick={() => openConnectModal && openConnectModal()}
      className="px-4 py-2 rounded-xl bg-blue-500 text-white"
    >
      Connect
    </button>
  );
}
```

If you're not using `useConnectModal`, your component will not hook into RainbowKit properly → fallback to default button.

---

# ✅ **3. The custom button is rendering _before_ RainbowKitProvider**

This is the **#1 real cause** in Next.js App Router.

If your custom connect button renders **outside** the provider, the hook returns `undefined`, so RainbowKit silently renders the default UI.

### ✔ Your layout must look like this:

```tsx
// app/layout.tsx
"use client";

import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
```

### ❌ If you put your custom button in `layout.tsx` _above_ the providers → RainbowKit will ignore it.

---

# ⭐ Ultimate 10-second test

Add this inside a **client component** under the provider:

```tsx
const { openConnectModal } = useConnectModal();
console.log("RainbowKit modal:", openConnectModal);
```

### If `openConnectModal` = **undefined** →

Your component is **not inside RainbowKitProvider**, so the custom button won't work.

### If it prints a function →

Your provider is correct, and the issue is either:

✔ duplicate `<ConnectButton />`
✔ wrong custom button code
✔ connection state already active

---

# 🎯 Want me to solve it instantly?

Send me just **two files**:

1. `app/layout.tsx`
2. Your custom connect button component

I will tell you exactly why your custom UI is not appearing and fix it on the spot.
