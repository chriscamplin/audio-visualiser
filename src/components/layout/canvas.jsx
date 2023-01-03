import { OrbitControls, PerformanceMonitor, Stats } from '@react-three/drei'
import { StrictMode, useEffect, useRef } from 'react'

import { Canvas } from '@react-three/fiber'
import RecordCanvas from '@/components/dom/RecordCanvas'
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
  return <OrbitControls ref={control} domElement={dom.current} />
}

const LCanvas = ({ children }) => {
  const canvasRef = useRef()
  // const { startRecording, isRecording } = useCapture()

  const dom = useStore((state) => state.dom)

  return (
    <StrictMode>
      <RecordCanvas canvRef={canvasRef} />
      <Canvas
        // orthographic
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
        }}
        shadows
        onCreated={({ events, gl }) => {
          // console.log(gl)
          events.connect(dom.current)
        }}
        // shadows
        gl={{
          // alpha: false,
          sortObjects: false,
          preserveDrawingBuffer: true,
        }}
        dpr={1}
        camera={{ zoom: 14, position: [0, 0, 2], fov: 40 }}
      >
        {/* 💡 not having a clear color would glitch the recording */}
        <color attach='background' args={['#000']} />

        {/* <Stats /> */}
        <LControl />
        {/* <Preload all /> */}
        {children}
      </Canvas>
    </StrictMode>
  )
}

export default LCanvas
