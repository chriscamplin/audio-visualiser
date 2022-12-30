import AudioViz from './AudioViz'
import useStore from '@/helpers/store'

const AudioVizWrapper = () => {
  const viewAudioViz = useStore((state) => state.viewAudioViz)
  return (
    viewAudioViz && (
      <>
        <AudioViz />
      </>
    )
  )
}
export default AudioVizWrapper
