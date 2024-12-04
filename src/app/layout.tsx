'use client'
import { Providers } from '@/app/providers'
import ExtensionLayout from '@/components/layouts/ExtensionLayout'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=800, height=600, initial-scale=1" />
      </head>
      <body className="bg-gray-50">
        <Providers>
          <ExtensionLayout>
            {children}
          </ExtensionLayout>
        </Providers>
      </body>
    </html>
  )
}
