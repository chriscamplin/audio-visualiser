import { useEffect } from 'react'

import { useLayout } from './useLayout'

export function useSourceTargetLayout({ data, layout }) {
  // prep for new animation by storing source
  useEffect(() => {
    for (let i = 0; i < data.length; ++i) {
      // console.log({x: data[i].x} || 0)
      data[i].sourceX = data[i].x || 0
      data[i].sourceY = data[i].y || 0
      data[i].sourceZ = data[i].z || 0
    }
  }, [data, layout])

  // run layout
  useLayout({ data, layout })
  console.log({ data }, layout)
  // store target
  useEffect(() => {
    for (let i = 0; i < data.length; ++i) {
      data[i].targetX = data[i].x
      data[i].targetY = data[i].y
      data[i].targetZ = data[i].z
    }
  }, [data, layout])
}
