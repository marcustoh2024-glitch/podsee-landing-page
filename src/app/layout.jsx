import './globals.css'

export const metadata = {
  title: 'Podsee - Tuition Discovery for Singapore Parents',
  description: 'Find the right tuition for your child without the noise. A calm, parent-first search experience.',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0a8aff',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
