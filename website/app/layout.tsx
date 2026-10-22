export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pl"><head><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex, nofollow"/><link rel="stylesheet" href="/assets/inbox.css"/></head><body>{children}</body></html>;
}
