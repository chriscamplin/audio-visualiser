import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'

import {
  aizawaAttractor,
  dadrasAttractorLayout,
  dequanLayout,
  gridLayout2D,
  gridLayout3D,
  lorenzLayout,
  modelLayout,
  offsetGrid,
  parametricLayout,
  phyllotaxisLayout,
  randomLayout,
  sphereLayout,
  spiralLayout,
  torusLayout,
} from '../helpers/layouts'

export const useLayout = ({ data, layout = 'grid2D' }) => {
  console.log('switching to: ', layout)
  const model = useGLTF('/models/bust-me.glb', '/draco-gltf')
  const [modelGeometry, setModelGeometry] = useState()

  useEffect(() => {
    if (layout !== 'model') return
    setModelGeometry(model.nodes.mesh.geometry.toNonIndexed())
  }, [layout, model])

  useEffect(() => {
    switch (layout) {
      case 'model':
        modelLayout(data, modelGeometry)
        break
      case 'random':
        randomLayout(data)
        break
      case 'dadras':
        dadrasAttractorLayout(data)
        break
      case 'phyllotaxis':
        phyllotaxisLayout(data)
        break
      case 'spiral':
        spiralLayout(data)
        break
      case 'lorenz':
        lorenzLayout(data)
        break
      case 'sphere':
        sphereLayout(data)
        break
      case 'parametric':
        parametricLayout(data)
        break
      case 'aizawa':
        aizawaAttractor(data)
        break
      case 'offset':
        offsetGrid(data)
        break
      case 'torus':
        torusLayout(data)
        break
      case 'dequan':
        dequanLayout(data)
        break
      case 'grid3D':
        gridLayout3D(data)
        break
      case 'grid2D':
      default: {
        gridLayout2D(data)
      }
    }
  }, [data, layout, modelGeometry])
}
