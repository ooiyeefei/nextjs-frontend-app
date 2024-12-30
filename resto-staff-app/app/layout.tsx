import '@/app/ui/global.css';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from "@/components/ui/toast"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Your App',
  description: 'Manage reservations efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark`}>
        <ToastProvider>
          {children}
        </ToastProvider>
        </body>
    </html>
  )
}