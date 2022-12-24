import { Suspense, useEffect, useRef } from 'react'
import { Track, Zoom } from '@/components/canvas/track'

import ShapingCurves from '@/components/canvas/ShapingCurves'
import useStore from '@/helpers/store/'

const AudioViz = () => {
  const viewAudioViz = useStore((state) => state.viewAudioViz)

  return viewAudioViz ? (
    <>
      {/* <spotLight position={[-4, 4, -4]} angle={0.06} penumbra={1} castShadow shadow-mapSize={[2048, 2048]} /> */}
      <Suspense fallback={null}>
        {/* <Track position-z={-0.25} url="/synth.mp3" />
        <Track position-z={0} url="/snare.mp3" />
        <Track position-z={0.25} url="/drum.mp3" />
        <Zoom url="/drum.mp3" /> */}
        <ShapingCurves />
      </Suspense>
      {/* <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.025, 0]}
        onClick={() => {
          useStore.setState({
            viewAudioViz: false,
          })
        }}
      >
        <planeGeometry />
        <shadowMaterial transparent opacity={0.15} />
      </mesh> */}
    </>
  ) : null
}

export default AudioViz
