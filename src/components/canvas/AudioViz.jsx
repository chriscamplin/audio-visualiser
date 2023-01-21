// import * as THREE from 'three'
import { Suspense } from 'react'
import { useVideoTexture } from '@react-three/drei'
import dynamic from 'next/dynamic'

import ProceduralBackground from '@/components/canvas/ProceduralBackground'

// import { Track, Zoom } from '@/components/canvas/track'
// import ShapingCurves from '@/components/canvas/ShapingCurves'
import useStore from '@/helpers/store/'

// const ShapingCurves = dynamic(
//   () => import('@/components/canvas/ShapingCurves'),
//   {
//     ssr: false,
//   }
// )
const Video = dynamic(() => import('@/components/canvas/Video'), {
  ssr: false,
})

// const PolarPlane = dynamic(() => import('@/components/canvas/Polar'), {
//   ssr: false,
// })
// const Floor = dynamic(() => import('@/components/canvas/Floor'), {
//   ssr: false,
// })

// const BubbleEmitter = dynamic(
//   () => import('@/components/canvas/BubbleEmitter'),
//   {
//     ssr: false,
//   }
// )
// const MarbleWrapper = dynamic(
//   () => import('@/components/canvas/MarbleWrapper'),
//   {
//     ssr: false,
//   }
// )

// const Dots = dynamic(() => import('@/components/canvas/Dots'), {
//   ssr: false,
// })
const Audio = dynamic(() => import('@/components/canvas/Audio'), {
  ssr: false,
})

// const step = 10

const AudioViz = () => {
  const viewAudioViz = useStore((state) => state.viewAudioViz)
  const url = '/audio/GarageTechno.mp3'
  const texture = useVideoTexture('/video/dj.mp4')

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
      <directionalLight intensity={5} position={[0, 0, 0]} color='#28c8e4' />
      <pointLight position={[100, 10, -50]} intensity={20} castShadow />
      {/* <pointLight position={[-100, -100, -100]} intensity={10} color='red' /> */}

      <directionalLight intensity={5} position={[-10, -10, -10]} color='red' />
      {/* <Environment
        background={false} // can be true, false or "only" (which only sets the background) (default: false)
        path='/'
        files='adamsbridge.hdr'
        preset={null}
        ground={{ height: 5, radius: 60, scale: 10 }}
        scene={undefined} // adds the ability to pass a custom THREE.Scene, can also be a ref
        encoding={undefined} // adds the ability to pass a custom THREE.TextureEncoding (default: THREE.sRGBEncoding for an array of files and THREE.LinearEncoding for a single texture)
      /> */}

      <Suspense fallback={null}>
        {/* <Track position-z={-0.25} url="/synth.mp3" />
        <Track position-z={0} url="/snare.mp3" />
        <Track position-z={0.25} url="/drum.mp3" /> */}
        {/* <Zoom url={'/audio/drum.mp3'} /> */}
        {/* <Dots url={url} /> */}
        {/* <Cube url={url} /> */}
        {/* <EffectComposer multisampling={0}>
          <SSAO
            samples={31}
            radius={0.1}
            intensity={30}
            luminanceInfluence={0.1}
            color='red'
          />
        </EffectComposer> */}

        {/* <ShapingCurves url={url} /> */}
        {/* <BubbleEmitter url={url} /> */}
        {/* <ProceduralBackground url={url} /> */}
        {/* <Audio url={url} /> */}
        <Track position-z={0.25} url="/drum.mp3" />
        {/* <Zoom url="/drum.mp3" /> */}
        {/* <Dots /> */}
        {/* <Floor /> */}
        {/* <ShapingCurves /> */}
        <Video url={url} />
        {/* <BubbleEmitter url={'/audio/drum.mp3'} /> */}
        <ProceduralBackground url={url} texture={texture} />
        <Audio url={url} />
        {/* <PolarPlane /> */}
        {/* <MarbleWrapper /> */}
      </Suspense>
    </>
  ) : null
}

export default AudioViz
