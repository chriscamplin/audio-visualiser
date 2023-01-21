import { useEffect } from 'react'
import { suspend } from 'suspend-react'

import createAudio from '@/helpers/createAudio'
import useStore from '@/helpers/store/'

export default function Audio({ url }) {
  const stopPlaying = useStore((state) => state.stopPlaying)

  // suspend-react is the library that r3f uses internally for useLoader. It caches promises and
  // integrates them with React suspense. You can use it as-is with or without r3f.
  const { gain, context } = suspend(() => createAudio(url), [url])
  useEffect(() => {
    // Connect the gain node, which plays the audio
    gain.connect(context.destination)
    // Disconnect it on unmount
    return () => gain.disconnect()
  }, [gain, context])

  useEffect(() => {
    console.log({ stopPlaying })
    // Connect the gain node, which plays the audio
    !stopPlaying ? context.resume() : context.suspend()
    // Disconnect it on unmount
  }, [context, stopPlaying])
}
