/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { AppProps } from 'next/app'

import '@/styles/tailwind.css'
import { SpeedInsights } from '@vercel/speed-insights/next'

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => <Component {...pageProps} />

export default App
