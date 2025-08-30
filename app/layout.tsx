import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import "leaflet/dist/leaflet.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata = {
  title: "Dashboard Rubix",
  description: "Dashboard Estratégico - Análise de Market Intelligence & Comunicação",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans bg-stone-50`}>
        <div className="relative min-h-screen">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-10rem] left-[-15rem] w-96 h-96 bg-sunglow/20 rounded-full filter blur-3xl opacity-50 animate-[blob-1_18s_infinite]"></div>
            <div className="absolute top-[15rem] right-[-10rem] w-96 h-96 bg-giants_orange/20 rounded-full filter blur-3xl opacity-40 animate-[blob-2_20s_infinite]"></div>
            <div className="absolute bottom-[-5rem] left-[5rem] w-80 h-80 bg-viridian/20 rounded-full filter blur-3xl opacity-50 animate-[blob-3_16s_infinite]"></div>
          </div>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
