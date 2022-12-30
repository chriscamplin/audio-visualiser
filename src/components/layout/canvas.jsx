import {
  OrbitControls,
  PerformanceMonitor,
  Preload,
  Stats,
} from '@react-three/drei'
import { StrictMode, useEffect, useRef, useState } from 'react'

import { Canvas } from '@react-three/fiber'
import useStore from '@/helpers/store'

const LControl = () => {
  const dom = useStore((state) => state.dom)
  const control = useRef(null)

  useEffect(() => {
    if (control.current) {
      const domElement = dom.current
      const originalTouchAction = domElement.style['touch-action']
      domElement.style['touch-action'] = 'none'

      return () => {
        domElement.style['touch-action'] = originalTouchAction
      }
    }
  }, [dom, control])
  // @ts-ignore
  return <OrbitControls ref={control} domElement={dom.current} />
}

const LCanvas = ({ children }) => {
  const canvasRef = useRef()
  console.log(canvasRef)
  const dom = useStore((state) => state.dom)
  return (
    <StrictMode>
      <Canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
        }}
        onCreated={({ events, gl }) => {
          console.log(gl)
          events.connect(dom.current)
        }}
        // shadows
        gl={{
          alpha: false,
          sortObjects: false,
        }}
        dpr={1}
        camera={{ position: [-1, 1.5, 2], fov: 65 }}
      >
        <Stats />
        <LControl />
        {/* <Preload all /> */}
        <PerformanceMonitor>{children}</PerformanceMonitor>
      </Canvas>
    </StrictMode>
  )
}

export default LCanvas
