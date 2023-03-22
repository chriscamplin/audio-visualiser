// Step 5 - delete Instructions components
import dynamic from 'next/dynamic'

// Dynamic import is used to prevent a payload when the website start that will include threejs r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
// const Shader = dynamic(() => import('@/components/canvas/Shader/Shader'), {
//   ssr: false,
// })

const Model = dynamic(() => import('@/components/canvas/Model'), {
  ssr: false,
})

// dom components goes here
const Page = () => (
  <>
    <div style={{ color: 'white' }}>Model</div>
  </>
)

// canvas components goes here
// It will receive same props as Page component (from getStaticProps, etc.)
Page.r3f = (props) => (
  <>
    <Model />
  </>
)

export default Page

export async function getStaticProps() {
  return {
    props: {
      title: 'Model',
    },
  }
}
