// Step 5 - delete Instructions components
import dynamic from 'next/dynamic'

import LayoutControls from '@/components/dom/LayoutControls'

// Dynamic import is used to prevent a payload when the website start that will include threejs r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
// const Shader = dynamic(() => import('@/components/canvas/Shader/Shader'), {
//   ssr: false,
// })
// const CubeAnimation = dynamic(
//   () => import('@/components/canvas/CubeAnimation'),
//   {
//     ssr: false,
//   }
// )
const Points = dynamic(() => import('@/components/canvas/Points'), {
  ssr: false,
})

const AudioViz = dynamic(() => import('@/components/canvas/AudioViz'), {
  ssr: false,
})
// const ProceduralBackground = dynamic(
//   () => import('@/components/canvas/ProceduralBackground'),
//   {
//     ssr: false,
//   }
// )

// dom components goes here
const Page = () => (
  <>
    <LayoutControls />
  </>
)

// canvas components goes here
// It will receive same props as Page component (from getStaticProps, etc.)
Page.r3f = (props) => (
  <>
    <AudioViz />
    <Points />
  </>
)

export default Page

export async function getStaticProps() {
  return {
    props: {
      title: 'Index',
    },
  }
}
