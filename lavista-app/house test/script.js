import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/3DMLoader.js'
import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/TransformControls.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'

// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' )

// initialise 'data' object that will be used by compute()
const definition = 'generativehouse.gh';
/*const data = {
  definition: 'generativehouse.gh',
  inputs: getInputs()
}*/

const slope = document.getElementById( 'RH_IN:slope' )
slope.addEventListener( 'mouseup', onSliderChange, false )
slope.addEventListener( 'touchend', onSliderChange, false )
const height = document.getElementById( 'RH_IN:height' )
height.addEventListener( 'mouseup', onSliderChange, false )
height.addEventListener( 'touchend', onSliderChange, false )
const houseDepth = document.getElementById( 'RH_IN:houseDepth' )
houseDepth.addEventListener( 'mouseup', onSliderChange, false )
houseDepth.addEventListener( 'touchend', onSliderChange, false )
const houseWidth = document.getElementById( 'RH_IN:houseWidth' )
houseWidth.addEventListener( 'mouseup', onSliderChange, false )
houseWidth.addEventListener( 'touchend', onSliderChange, false )
const count = document.getElementById( 'RH_IN:count' )
count.addEventListener( 'mouseup', onSliderChange, false )
count.addEventListener( 'touchend', onSliderChange, false )
const generator = document.getElementById( 'RH_IN:generator' )
generator.addEventListener( 'mouseup', onSliderChange, false )
generator.addEventListener( 'touchend', onSliderChange, false )
const location = document.getElementById( 'RH_IN:location' )
location.addEventListener( 'mouseup', onSliderChange, false )
location.addEventListener( 'touchend', onSliderChange, false )
const windowCount = document.getElementById( 'RH_IN:windowCount' )
windowCount.addEventListener( 'mouseup', onSliderChange, false )
windowCount.addEventListener( 'touchend', onSliderChange, false )
const sillHeight = document.getElementById( 'RH_IN:sillHeight' )
sillHeight.addEventListener( 'mouseup', onSliderChange, false )
sillHeight.addEventListener( 'touchend', onSliderChange, false )
const windowHeight = document.getElementById( 'RH_IN:windowHeight' )
windowHeight.addEventListener( 'mouseup', onSliderChange, false )
windowHeight.addEventListener( 'touchend', onSliderChange, false )
const windowWidth = document.getElementById( 'RH_IN:windowWidth' )
windowWidth.addEventListener( 'mouseup', onSliderChange, false )
windowWidth.addEventListener( 'touchend', onSliderChange, false )
const poolLarge = document.getElementById( 'RH_IN:poolLarge' )
poolLarge.addEventListener( 'mouseup', onSliderChange, false )
poolLarge.addEventListener( 'touchend', onSliderChange, false )
const poolWidth = document.getElementById( 'RH_IN:poolWidth' )
poolWidth.addEventListener( 'mouseup', onSliderChange, false )
poolWidth.addEventListener( 'touchend', onSliderChange, false )


const showRoof = document.getElementById('RH_IN:showRoof');
showRoof.addEventListener( 'change', onSliderChange, false )

let points = []

// globals
let rhino, doc

rhino3dm().then(async m => {
    rhino = m

    init()
    initialPts()
    compute()
})

const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download

  /////////////////////////////////////////////////////////////////////////////
 //                            HELPER  FUNCTIONS                            //
/////////////////////////////////////////////////////////////////////////////

/**
 * Gets <input> elements from html and sets handlers
 * (html is generated from the grasshopper definition)
 
function getInputs() {
  const inputs = {}
  for (const input of document.getElementsByTagName('input')) {
    switch (input.type) {
      case 'number':
        inputs[input.id] = input.valueAsNumber
        input.onchange = onSliderChange
        break
      case 'range':
        inputs[input.id] = input.valueAsNumber
        input.onmouseup = onSliderChange
        input.ontouchend = onSliderChange
        break
      case 'checkbox':
        inputs[input.id] = input.checked
        input.onclick = onSliderChange
        break
      default:
        break
    }
  }
  return inputs
}*/

function initialPts() {

  const startPts = [
    { x: 0, y: 0, z: 0 },
    { x: 8, y: 20, z: 0 },
    { x: 9, y: 7, z: 0 },
]
const cntPts = startPts.length

  for (let i = 0; i < cntPts; i++) {
    const x = startPts[i].x
    const y = startPts[i].y
    const z = startPts[i].z

    const pt = "{\"X\":" + x + ",\"Y\":" + y + ",\"Z\":" + z + "}"

    console.log( `x ${x} y ${y}` )

    points.push(pt)

    //viz in three
    const icoGeo = new THREE.IcosahedronGeometry(0.5)
    const icoMat = new THREE.MeshNormalMaterial()
    const ico = new THREE.Mesh( icoGeo, icoMat )
    ico.name = 'ico'
    ico.position.set( x, y, z)
    scene.add( ico )
    
    let tcontrols = new TransformControls( camera, renderer.domElement )
    tcontrols.enabled = true
    tcontrols.attach( ico )
    tcontrols.showZ = false
    tcontrols.addEventListener( 'dragging-changed', onChange )
    scene.add(tcontrols)
    
  }

}

let dragging = false
function onChange() {
  dragging = ! dragging
  if ( !dragging ) {
    // update points position
    points = []
    scene.traverse(child => {
      if ( child.name === 'ico' ) {
        const pt = "{\"X\":" + child.position.x + ",\"Y\":" + child.position.y + ",\"Z\":" + child.position.z + "}"
        points.push( pt )
        console.log(pt)
      }
    }, false)

    compute()

    controls.enabled = true
    return 
}

  controls.enabled = false

}

/**
 * Call appserver
 */
 async function compute () {

  const data = {
    definition: definition,
    inputs: {
      'RH_IN:slope': slope.valueAsNumber,
      'RH_IN:height': height.valueAsNumber,
      'RH_IN:houseDepth': houseDepth.valueAsNumber,
      'RH_IN:houseWidth': houseWidth.valueAsNumber,
      'RH_IN:count': count.valueAsNumber,
      'RH_IN:generator': generator.valueAsNumber,
      'RH_IN:location': location.valueAsNumber,
      'RH_IN:windowCount': windowCount.valueAsNumber,
      'RH_IN:sillHeight': sillHeight.valueAsNumber,
      'RH_IN:windowHeight': windowHeight.valueAsNumber,
      'RH_IN:windowWidth': windowWidth.valueAsNumber,
      'RH_IN:poolLarge': poolLarge.valueAsNumber,
      'RH_IN:poolWidth': poolWidth.valueAsNumber,

      'RH_IN:showRoof': showRoof.checked,

      'points': points
    }
  }

  showSpinner(true)

  console.log(data.inputs)

  const request = {
    'method':'POST',
    'body': JSON.stringify(data),
    'headers': {'Content-Type': 'application/json'}
  }

  try {
    const response = await fetch('/solve', request)

    if(!response.ok)
      throw new Error(response.statusText)

    const responseJson = await response.json()
    collectResults(responseJson)

  } catch(error){
    console.error(error)
  }
}

/**
 * Parse response
 */
 function collectResults(responseJson) {

  const values = responseJson.values

  console.log(values)

  // clear doc
  try {
    if( doc !== undefined)
        doc.delete()
  } catch {}

  //console.log(values)
  doc = new rhino.File3dm()

  // for each output (RH_OUT:*)...
  for ( let i = 0; i < values.length; i ++ ) {
    // ...iterate through data tree structure...
    for (const path in values[i].InnerTree) {
      const branch = values[i].InnerTree[path]
      // ...and for each branch...
      for( let j = 0; j < branch.length; j ++) {
        // ...load rhino geometry into doc
        const rhinoObject = decodeItem(branch[j])
        if (rhinoObject !== null) {
          // console.log(rhinoObject)
          doc.objects().add(rhinoObject, null)
        }
      }
    }
  }

  if (doc.objects().count < 1) {
    console.error('No rhino objects to load!')
    showSpinner(false)
    return
  }

  // load rhino doc into three.js scene
  const buffer = new Uint8Array(doc.toByteArray()).buffer
  loader.parse( buffer, function ( object ) 
  {
            // debug 
        /*
        object.traverse(child => {
          if (child.material !== undefined)
            child.material = new THREE.MeshNormalMaterial()
        }, false)
        */

      // clear objects from scene
      scene.traverse(child => {
        if ( child.userData.hasOwnProperty( 'objectType' ) && child.userData.objectType === 'File3dm') {
          scene.remove( child )
        }
      })

            // add object graph from rhino model to three.js scene
      scene.add( object )

      // hide spinner and enable download button
      showSpinner(false)
      downloadButton.disabled = false

      /* zoom to extents*/
      //  zoomCameraToSelection(camera, controls, scene.children)
  })
}

/**
* Attempt to decode data tree item to rhino geometry
*/
function decodeItem(item) {
const data = JSON.parse(item.data)
if (item.type === 'System.String') {
  // hack for draco meshes
  try {
      return rhino.DracoCompression.decompressBase64String(data)
  } catch {} // ignore errors (maybe the string was just a string...)
} else if (typeof data === 'object') {
  return rhino.CommonObject.decode(data)
}
return null
}

/**
 * Called when a slider value changes in the UI. Collect all of the
 * slider values and call compute to solve for a new scene
 */
 function onSliderChange () {
  showSpinner(true)
  // get slider values
  /*let inputs = {}
  for (const input of document.getElementsByTagName('input')) {
    switch (input.type) {
    case 'number':
      inputs[input.id] = input.valueAsNumber
      break
    case 'range':
      inputs[input.id] = input.valueAsNumber
      break
    case 'checkbox':
      inputs[input.id] = input.checked
      break
    }
  }
    
  data.inputs = inputs*/

  compute()
}

/**
 * The animation loop!
 */
 function animate() {
  requestAnimationFrame( animate )
  controls.update()
  renderer.render(scene, camera)
}

// more globals
let scene, camera, renderer, controls

/**
 * Sets up the scene, camera, renderer, lights and controls and starts the animation
 */
function init() {

  // Rhino models are z-up, so set this as the default
  THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

  // create a scene and a camera
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xEDF5FB)
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(-12, -8, 15) // like perspective view

  // very light grey for background, like rhino
  //scene.background = new THREE.Color('whitesmoke')

  // create the renderer and add it to the html
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // add some controls to orbit the camera
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(8,12,-5);
  controls.update();

  // add a directional light
  const directionalLight = new THREE.DirectionalLight( 0xFFF8E4 )
  directionalLight.intensity = 2
  directionalLight.position.set(-10,-10,15)
  scene.add( directionalLight )

  const ambientLight = new THREE.AmbientLight()
  scene.add( ambientLight )

  // handle changes in the window size
  window.addEventListener( 'resize', onWindowResize, false )

  animate()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
  animate()
}

/**
 * This function is called when the download button is clicked
 */
 function download () {
    // write rhino doc to "blob"
    const bytes = doc.toByteArray()
    const blob = new Blob([bytes], {type: "application/octect-stream"})

    // use "hidden link" trick to get the browser to download the blob
    const filename = definition.replace(/\.gh$/, '') + '.3dm'
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
}

/**
 * Shows or hides the loading spinner
 */
 function showSpinner(enable) {
  if (enable)
    document.getElementById('loader').style.display = 'block'
  else
    document.getElementById('loader').style.display = 'none'
}

/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 
 function zoomCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
  
  const box = new THREE.Box3();
  
  for( const object of selection ) {
    if (object.isLight) continue
    box.expandByObject( object );
  }
  
  const size = box.getSize( new THREE.Vector3() );
  const center = box.getCenter( new THREE.Vector3() );
  
  const maxSize = Math.max( size.x, size.y, size.z );
  const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
  
  const direction = controls.target.clone()
    .sub( camera.position )
    .normalize()
    .multiplyScalar( distance );
  controls.maxDistance = distance * 10;
  controls.target.copy( center );
  
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  camera.position.copy( controls.target ).sub(direction);
  
  controls.update();
}*/