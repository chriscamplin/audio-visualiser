import * as React from 'react'
import * as THREE from 'three'

const SELECTED_COLOR = '#ff0099'
const DEFAULT_COLOR = '#ff9944'

// const SELECTED_COLOR = '#6f6';
// const DEFAULT_COLOR = '#888';

// re-use for instance computations
const scratchColor = new THREE.Color()

export const usePointColors = ({ data, selectedPoint }) => {
  const numPoints = data.length
  const colorAttrib = React.useRef()
  const colorArray = React.useMemo(
    () => new Float32Array(numPoints * 3),
    [numPoints]
  )

  React.useEffect(() => {
    for (let i = 0; i < data.length; i += 1) {
      scratchColor.set(
        data[i] === selectedPoint ? SELECTED_COLOR : DEFAULT_COLOR
      )
      scratchColor.toArray(colorArray, i * 3)
    }
    colorAttrib.current.needsUpdate = true
  }, [data, selectedPoint, colorArray])

  return { colorAttrib, colorArray }
}
