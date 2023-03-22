import { useEffect, useState } from 'react'

// import { Easings } from '@/lib/easings'

// let time = 0
// const diff = 30

// const minTime = 0
// const maxTime = 1000

// function easeInOutQuad(t, b, c, d) {
//   // eslint-disable-next-line no-cond-assign
//   if ((t /= d / 2) < 1) return (c / 2) * t * t + b
//   return (-c / 2) * (--t * (t - 2) - 1) + b
// }

export default function useYearCounter() {
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    if (counter > 144) return

    const timeout = setTimeout(() => {
      setCounter(counter + 1)
    }, 100)
    // time = easeInOutQuad(counter, minTime, maxTime, diff)

    if (counter > 144) {
      return () => {
        clearTimeout(timeout)
      }
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [counter])

  return { counter }
}
