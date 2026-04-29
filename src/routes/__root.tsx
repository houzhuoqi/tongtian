import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gold">404</h1>
        <h2 className="mt-4 font-display text-xl text-foreground">山中無此路</h2>
        <p className="mt-2 text-sm text-muted-foreground">所尋之徑，已隱於霧中。</p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md border border-gold/50 bg-background px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/10"
        >
          返回庙前
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      },
      { title: "通天大聖靈籤 · 山中秘庙求签" },
      {
        name: "description",
        content: "第一人称沉浸式参拜通天大圣，请愿、掷阴阳筊、摇签、AI 解签的东方神话仪式体验。",
      },
      { name: "theme-color", content: "#0d0e12" },
      { property: "og:title", content: "通天大聖靈籤 · 山中秘庙求签" },
      { property: "og:description", content: "Great Sage Oracle is a 3D dark fantasy divination app where users seek guidance from the Great Sage." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "通天大聖靈籤 · 山中秘庙求签" },
      { name: "description", content: "Great Sage Oracle is a 3D dark fantasy divination app where users seek guidance from the Great Sage." },
      { name: "twitter:description", content: "Great Sage Oracle is a 3D dark fantasy divination app where users seek guidance from the Great Sage." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/821c8ac2-2686-4590-a356-552aa5bee4b1/id-preview-e37be75a--90bc9811-cd20-4080-844b-0453939c16ee.lovable.app-1777490688143.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/821c8ac2-2686-4590-a356-552aa5bee4b1/id-preview-e37be75a--90bc9811-cd20-4080-844b-0453939c16ee.lovable.app-1777490688143.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;500;700;900&family=Noto+Serif+SC:wght@400;500;700&display=swap",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
