import { useState } from 'react'

// import { a as aw, useSpring as useSpringWeb } from '@react-spring/web'
import Marble from './Shader/Marble'

// // HSL color values
// const options = [
//   [0, 100, 50],
//   [60, 100, 50],
//   [150, 100, 50],
//   [240, 70, 60],
//   [0, 0, 80],
// ]

const MarbleWrapper = () => {
  const [step, setStep] = useState(0)
  // const { hsl } = useSpringWeb({
  //   hsl: options[step % options.length],
  //   config: { tension: 50 },
  // })
  const url = '/audio/mannyEarlAye.mp3'

  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <>
      <Marble step={step} setStep={setStep} url={url} />
    </>
  )
}
export default MarbleWrapper
