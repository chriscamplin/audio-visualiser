import create from 'zustand'

const useStore = create(() => {
  return {
    router: null,
    dom: null,
    viewAudioViz: false,
  }
})

export default useStore
