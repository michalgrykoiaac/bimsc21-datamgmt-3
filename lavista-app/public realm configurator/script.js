
    
// Import libraries
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js";
import rhino3dm from "https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/rhino3dm.module.js";
import { RhinoCompute } from "https://cdn.jsdelivr.net/npm/compute-rhino3d@0.13.0-beta/compute.rhino3d.module.js";
import { Rhino3dmLoader } from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js";

const definitionName = "street_node_main.gh";

// Set up site sliders
const siteLength_slider = document.getElementById('siteLength')
siteLength_slider.addEventListener('mouseup', onSliderChange, false)
siteLength_slider.addEventListener('touchend', onSliderChange, false)

const siteWidth_slider = document.getElementById('siteWidth')
siteWidth_slider.addEventListener('mouseup', onSliderChange, false)
siteWidth_slider.addEventListener('touchend', onSliderChange, false)


// Set up street sliders
const streetAngle_slider = document.getElementById('streetAngle')
streetAngle_slider.addEventListener('mouseup', onSliderChange, false)
streetAngle_slider.addEventListener('touchend', onSliderChange, false)

const streetWidth_slider = document.getElementById('streetWidth')
streetWidth_slider.addEventListener('mouseup', onSliderChange, false)
streetWidth_slider.addEventListener('touchend', onSliderChange, false)

const streetPosition_slider = document.getElementById('streetPosition')
streetPosition_slider.addEventListener('mouseup', onSliderChange, false)
streetPosition_slider.addEventListener('touchend', onSliderChange, false)



// Set up apartment sliders
const buildingDepth_slider = document.getElementById('buildingDepth')
buildingDepth_slider.addEventListener('mouseup', onSliderChange, false)
buildingDepth_slider.addEventListener('touchend', onSliderChange, false)

const buildingGap_slider = document.getElementById('buildingGap')
buildingGap_slider.addEventListener('mouseup', onSliderChange, false)
buildingGap_slider.addEventListener('touchend', onSliderChange, false)

const podiumHeight_slider = document.getElementById('podiumHeight')
podiumHeight_slider.addEventListener('mouseup', onSliderChange, false)
podiumHeight_slider.addEventListener('touchend', onSliderChange, false)

const floorHeight_slider = document.getElementById('floorHeight')
floorHeight_slider.addEventListener('mouseup', onSliderChange, false)
floorHeight_slider.addEventListener('touchend', onSliderChange, false)

const levelNumber_slider = document.getElementById('levelNumber')
levelNumber_slider.addEventListener('mouseup', onSliderChange, false)
levelNumber_slider.addEventListener('touchend', onSliderChange, false)


//const showRoof = document.getElementById('RH_IN:showRoof');
//showRoof.addEventListener( 'change', onSliderChange, true )

const loader = new Rhino3dmLoader();
loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/");

let rhino, definition, doc;
rhino3dm().then(async (m) => {
  console.log("Loaded rhino3dm.");
  rhino = m; // global

  //RhinoCompute.url = getAuth( 'RHINO_COMPUTE_URL' ) // RhinoCompute server url. Use http://localhost:8081 if debugging locally.
  //RhinoCompute.apiKey = getAuth( 'RHINO_COMPUTE_KEY' )  // RhinoCompute server api key. Leave blank if debugging locally.

  RhinoCompute.url = "http://localhost:8081/"; //if debugging locally.

  // load a grasshopper file!

  const url = definitionName;
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const arr = new Uint8Array(buffer);
  definition = arr;

  init();
  compute();
});

async function compute() {

   const param1 = new RhinoCompute.Grasshopper.DataTree('Site Length')
   param1.append([0], [siteLength_slider.valueAsNumber])

    const param2 = new RhinoCompute.Grasshopper.DataTree('Site Width')
    param2.append([0], [siteWidth_slider.valueAsNumber])




    const param3 = new RhinoCompute.Grasshopper.DataTree('Street Angle')
    param3.append([0], [streetAngle_slider.valueAsNumber])

    const param4 = new RhinoCompute.Grasshopper.DataTree('Street Width')
    param4.append([0], [streetWidth_slider.valueAsNumber])

    const param5 = new RhinoCompute.Grasshopper.DataTree('Street Position')
    param5.append([0], [streetPosition_slider.valueAsNumber])




    const param6 = new RhinoCompute.Grasshopper.DataTree('Building Depth')
    param6.append([0], [buildingDepth_slider.valueAsNumber])

    const param7 = new RhinoCompute.Grasshopper.DataTree('Building Gap')
    param7.append([0], [buildingGap_slider.valueAsNumber])

    const param8 = new RhinoCompute.Grasshopper.DataTree('Podium Height')
    param8.append([0], [podiumHeight_slider.valueAsNumber])

    const param9 = new RhinoCompute.Grasshopper.DataTree('Floor Height')
    param9.append([0], [floorHeight_slider.valueAsNumber])

    const param10 = new RhinoCompute.Grasshopper.DataTree('Level Number')
    param10.append([0], [levelNumber_slider.valueAsNumber])

/*
    


    const param11 = new RhinoCompute.Grasshopper.DataTree('RH_IN:showRoof')
    param11.append([0], [showRoof.checked])
   
*/
    // clear values
    const trees = []
    trees.push(param1)
    trees.push(param2)

  
    trees.push(param3)
    trees.push(param4)
    trees.push(param5)

      
    trees.push(param6)
    trees.push(param7)
    trees.push(param8)
    trees.push(param9)
    trees.push(param10)
/*


    trees.push(param11)
*/

  const res = await RhinoCompute.Grasshopper.evaluateDefinition(
    definition,
    trees
  );


  //console.log(res);

  doc = new rhino.File3dm();

  // hide spinner
  document.getElementById("loader").style.display = "none";

  //decode grasshopper objects and put them into a rhino document
  for (let i = 0; i < res.values.length; i++) {
    for (const [key, value] of Object.entries(res.values[i].InnerTree)) {
      for (const d of value) {
        const data = JSON.parse(d.data);
        const rhinoObject = rhino.CommonObject.decode(data);
        doc.objects().add(rhinoObject, null);
      }
    }
  }


   


  // go through the objects in the Rhino document

  let objects = doc.objects();
  for ( let i = 0; i < objects.count; i++ ) {
  
    const rhinoObject = objects.get( i );


     // asign geometry userstrings to object attributes
    if ( rhinoObject.geometry().userStringCount > 0 ) {
      const g_userStrings = rhinoObject.geometry().getUserStrings()
      console.log(g_userStrings)
      rhinoObject.attributes().setUserString(g_userStrings[0][0], g_userStrings[0][1])
      
    }
  }


  // clear objects from scene
  scene.traverse((child) => {
    if (!child.isLight) {
      scene.remove(child);
    }
  });

  const buffer = new Uint8Array(doc.toByteArray()).buffer;
  loader.parse(buffer, function (object) {

    // go through all objects, check for userstrings and assing colors

    object.traverse((child) => {
      if (child.isMesh) {

        if (child.userData.attributes.geometry.userStringCount > 0 && child.userData.attributes.userStrings[0][0] == "terrace area") {
           
            //console.log(child.userData.attributes.userStrings[0][1])
          
          const terraceData = child.userData.attributes.userStrings[0];
          const terraceArea = terraceData[1];

          document.getElementById('Terrace').innerText = `Terrace area: ${terraceArea} m2` ;

         console.log(`Total terrace area is ${terraceArea} m2`);

         } else if (child.userData.attributes.userStrings[0][0] == "podium area"){

            const podiumData = child.userData.attributes.userStrings[0];
            const podiumArea = podiumData[1];

            document.getElementById('Podium').innerText = `Podium area:  ${podiumArea} m2` ;

            console.log(`Total podium area is ${podiumArea} m2`);


        } else if (child.userData.attributes.userStrings[0][0] == "apartment area"){

            const apartmentData = child.userData.attributes.userStrings[0];
            const apartmentArea = apartmentData[1];

            document.getElementById('Apartments').innerText = `Apartment area:  ${apartmentArea} m2` ;

            console.log(`Total apartment area is ${apartmentArea} m2`);

         } else {


            console.log("no data strings");

            
        
        }
      }
    });

    ///////////////////////////////////////////////////////////////////////
    // add object graph from rhino model to three.js scene    /n
    scene.add(object);

  })
}

function onSliderChange() {
  // show spinner
  document.getElementById("loader").style.display = "block";
  compute();
}



// BOILERPLATE //

let scene, camera, renderer, controls

function init() {

    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 )

    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0xf2f2f2)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0,0,250);

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // add some controls to orbit the camera
    controls = new OrbitControls(camera, renderer.domElement)

    // add a directional light


      // add a directional light
    const directionalLight = new THREE.DirectionalLight( 0xFFF8E4 )
    directionalLight.intensity = 2
    directionalLight.position.set(-10,-10,15)
    scene.add( directionalLight )

    const ambientLight = new THREE.AmbientLight()
    ambientLight.intensity = 3
    scene.add( ambientLight )

    animate()
}

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    animate()
}

function meshToThreejs(mesh, material) {
    const loader = new THREE.BufferGeometryLoader()
    const geometry = loader.parse(mesh.toThreejsJSON())
    return new THREE.Mesh(geometry, material)
}