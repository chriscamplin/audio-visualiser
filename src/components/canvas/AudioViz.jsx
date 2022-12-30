import * as THREE from 'three'

import { Suspense, useRef, useState } from 'react'
import { Track, Zoom } from '@/components/canvas/track'

import ShapingCurves from '@/components/canvas/ShapingCurves'
import useStore from '@/helpers/store/'

const AudioViz = () => {
  const viewAudioViz = useStore((state) => state.viewAudioViz)

  return viewAudioViz ? (
    <>
      <ambientLight intensity={0.25} />
      <spotLight
        intensity={1}
        angle={0.2}
        penumbra={1}
        position={[30, 30, 30]}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight
        intensity={5}
        position={[-10, -10, -10]}
        color='purple'
      />

      <Suspense fallback={null}>
        {/* <Track position-z={-0.25} url="/synth.mp3" />
        <Track position-z={0} url="/snare.mp3" />
        <Track position-z={0.25} url="/drum.mp3" />
        <Zoom url="/drum.mp3" /> */}
        <ShapingCurves />
      </Suspense>
    </>
  ) : null
}

export default AudioViz
