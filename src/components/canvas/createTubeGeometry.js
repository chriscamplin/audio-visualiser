import * as THREE from 'three'

export default function createTubeGeometry(
  numSides = 8,
  subdivisions = 50,
  openEnded = false
) {
  // create a base CylinderGeometry which handles UVs, end caps and faces
  const radius = 1
  const length = 1
  const baseGeometry = new THREE.CylinderGeometry(
    radius,
    radius,
    length,
    numSides,
    subdivisions,
    openEnded
  ).toNonIndexed()
  console.log({ baseGeometry })
  // fix the orientation so X can act as arc length
  baseGeometry.rotateZ(Math.PI / 2)

  // compute the radial angle for each position for later extrusion
  const tmpVec = new THREE.Vector2()

  const uvAttribute = baseGeometry.getAttribute('uv')

  const faceVertexUvs = uvAttribute.array
  // const faceVertexUvs = baseGeometry.faceVertexUvs[0]

  // This gets the array of all positions [x, y, z, x, y, z, x, y z,...]
  const positions = baseGeometry.getAttribute('position').array

  // This gets # of vertices
  const vertexCount = baseGeometry.getAttribute('position').count
  // dispose old geometry since we no longer need it
  //baseGeometry.dispose()

  // We'll store each vertex in this Vec3
  // const indices = baseGeometry.getIndex().array
  // const index = baseGeometry.getIndex()
  console.log(vertexCount)
  const tmpVec31 = new THREE.Vector3()
  const tmpVec32 = new THREE.Vector3()
  const tmpVec33 = new THREE.Vector3()
  const tmpVec22 = new THREE.Vector3()
  const posArray = new Float32Array(vertexCount)
  const angleArray = new Float32Array(vertexCount)
  const uvs = []

  const uvArray = new Float32Array(vertexCount * 2)
  let idx = 0
  let uvIdx = 0

  for (let i = 0; i < vertexCount; i += 3) {
    const a = positions[i + 0]
    const b = positions[i + 1]
    const c = positions[i + 2]
    const d = positions[i + 3]
    const e = positions[i + 4]
    const f = positions[i + 5]
    const g = positions[i + 6]
    const h = positions[i + 7]
    const i2 = positions[i + 8]

    const v0 = tmpVec31.set(a, b, c)
    const v1 = tmpVec32.set(d, e, f)
    const v2 = tmpVec33.set(g, h, i2)
    const faceUvsU = faceVertexUvs[i + 0]
    const faceUvsV = faceVertexUvs[i + 1]

    const face = [v0, v1, v2]
    // For each vertex in this face...
    face.forEach((v, j) => {
      // singleVertex.set(v.x, v.y, v.z)

      tmpVec.set(v.y, v.z).normalize()

      // the radial angle around the tube
      const angle = Math.atan2(tmpVec.y, tmpVec.x)
      // console.log(angle, idx)
      angleArray.set([angle], idx)
      // console.log(v.x, idx)
      // "arc length" in range [-0.5 .. 0.5]
      posArray.set([v.x], idx)

      // copy over the UV for this vertex
      uvArray.set([faceUvsU, faceUvsV], uvIdx)
      idx++
      uvIdx += 2
    })
  }

  // build typed arrays for our attributes
  // const posArray = new Float32Array(xPositions)
  // const angleArray = new Float32Array(angles)
  // const uvArray = new Float32Array(uvs.length * 2)
  // console.log(uvs, posArray.length, uvs.length)
  // // unroll UVs
  // for (let i = 0; i < posArray.length; i++) {
  //   const u = uvs[i]?.x
  //   const v = uvs[i]?.y
  //   // console.log({ u, v })
  //   uvArray[i * 2 + 0] = u
  //   uvArray[i * 2 + 1] = v
  // }
  console.log({ posArray, angleArray, uvArray })

  console.log({ baseGeometry })
  const tubeGeometry = new THREE.BufferGeometry()
  tubeGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 1))
  tubeGeometry.setAttribute('angle', new THREE.BufferAttribute(angleArray, 1))
  tubeGeometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))

  return tubeGeometry
}
