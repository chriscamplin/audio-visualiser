// import * as THREE from 'three'
import ProceduralBackground from '@/components/canvas/ProceduralBackground'
import { Suspense } from 'react'
// import { Environment } from '@react-three/drei'
import dynamic from 'next/dynamic'
// import { Track, Zoom } from '@/components/canvas/track'
// import ShapingCurves from '@/components/canvas/ShapingCurves'
import useStore from '@/helpers/store/'

// import ShapingCurves from '@/components/canvas/ShapingCurves'


const ShapingCurves = dynamic(
  () => import('@/components/canvas/ShapingCurves'),
  {
    ssr: false,
  }
)
// const BubbleEmitter = dynamic(
//   () => import('@/components/canvas/BubbleEmitter'),
//   {
//     ssr: false,
//   }
// )
const MarbleWrapper = dynamic(
  () => import('@/components/canvas/MarbleWrapper'),
  {
    ssr: false,
  }
)

// const Dots = dynamic(() => import('@/components/canvas/Dots'), {
//   ssr: false,
// })
// const Audio = dynamic(() => import('@/components/canvas/Audio'), {
//   ssr: false,
// })

// const step = 10

const AudioViz = () => {
  const viewAudioViz = useStore((state) => state.viewAudioViz)
  const url = '/audio/GarageTechno.mp3'

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
      <pointLight position={[-100, -100, -100]} intensity={10} color='red' />

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
        <Track position-z={0.25} url="/drum.mp3" />*/}
        {/* <Zoom url={'/audio/drum.mp3'} /> */}
        <Dots url={url} />
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
        {/* <MarbleWrapper /> */}
      </Suspense>
    </>
  ) : null
}

export default AudioViz
