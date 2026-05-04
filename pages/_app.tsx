import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import { ProgressProvider } from '@/context/ProgressContext'
import Layout from '@/components/layout/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ProgressProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ProgressProvider>
  )
}
