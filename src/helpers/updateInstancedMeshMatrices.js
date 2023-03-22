import * as THREE from 'three'

// re-use for instance computations
const scratchObject3D = new THREE.Object3D()
/**
 *
 * Instead of mapping over the data points, we tell the InstancedMesh how many instances there are (via the args prop) 
 * then set the individual positions and rotations for each instance in the useEffect hook. 
 * When the number of data points changes, we re-compute the layout for them (in this case, re-using the 30 column 
 * layout from earlier). We make use of scratchObject3D to do the hard matrix math for us instead of setting prop values.

*/
export function updateInstancedMeshMatrices({ mesh, data }) {
  if (!mesh) return
  // const clock = new THREE.Clock()
  // set the transform matrix for each instance
  for (let i = 0; i < data.length; i += 1) {
    const { x, y, z } = data[i]

    scratchObject3D.position.set(x, y, z)
    // scratchObject3D.scale.set(Math.random(), Math.random(), Math.random())
    scratchObject3D.rotation.set(0.5 * Math.PI, Math.PI * 0.25, 0.25 * Math.PI) // cylinders face z direction
    scratchObject3D.updateMatrix()
    mesh.setMatrixAt(i, scratchObject3D.matrix)
  }

  mesh.instanceMatrix.needsUpdate = true
}
