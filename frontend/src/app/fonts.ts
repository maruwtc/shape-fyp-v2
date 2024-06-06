import { Rubik, Caveat } from 'next/font/google'

const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
})

const caveat = Caveat({
  subsets: ['latin'],
})

export const fonts = {
  rubik,
  caveat,
}