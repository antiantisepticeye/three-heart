import * as THREE from './modules/three.module.js';
import { OrbitControls } from "./modules/OrbitControls.js";
import { SVGLoader } from "./modules/SVGLoader.js";
import { RectAreaLightUniformsLib } from './modules/RectAreaLightUniformsLib.js';
RectAreaLightUniformsLib.init()


import { EffectComposer } from './modules/EffectComposer.js';
import { RenderPass } from './modules/RenderPass.js';
import { UnrealBloomPass } from './modules/UnrealBloomPass.js';


import * as dat from './modules/dat.gui.module.js';




class Heart {
    constructor(elm) {
        this.speed = 1;
        this.elm = elm;    


        this.config = {
            floor: true,
            color: 0x00ffff,
            cycleColors: false,
            hueSpeed: 600,

            exposure: 1,
            bloomStrength: 1,
            bloomThreshold: 0,
            bloomRadius: 0.5
        };


        
        this.clock = new THREE.Clock();


        this.frame = 0;
        this.setupScene();
        this.setupLights();
        this.setupMesh();
        this.setupFloor();
        this.setupRenderer();
        this.setupCamera();
        this.setupRenderPasses();
        
        this.setupGUI();



    
    }

    get size() {
        const {width, height} = this.elm.getBoundingClientRect()
        let aspectRatio = width/height;
        return { width, height, aspectRatio }
    }

    setupScene() {
        this.scene = new THREE.Scene();
    }
    
    setupMesh() {
        const colorStageMat = new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
            color:0x73ffff
        })

        const svgMarkup = `
        <svg width="2" height="2" viewBox="0 0 2 2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.99361 0.657389C1.99361 0.354612 1.74817 0.109167 1.44544 0.109167C1.26167 0.109167 1.0995 0.199889 1 0.338556C0.9005 0.199889 0.738334 0.109167 0.554612 0.109167C0.251834 0.109167 0.00638962 0.354556 0.00638962 0.657389C0.00638962 0.700278 0.0118341 0.741834 0.0211674 0.781889C0.0972785 1.25483 0.623112 1.75378 1 1.89078C1.37683 1.75378 1.90272 1.25483 1.97872 0.781945C1.98817 0.741889 1.99361 0.700334 1.99361 0.657389V0.657389Z" fill="#808080"/>
        </svg>
        
        `;

        const loader = new SVGLoader();
        const svgData = loader.parse(svgMarkup);
        
        // Group that will contain all of our paths
        const svgGroup = new THREE.Group();
        
        const material = colorStageMat;
        
        // Loop through all of the parsed paths
        svgData.paths.forEach((path, i) => {
          const shapes = path.toShapes(true);
        
          // Each path has array of shapes
          shapes.forEach((shape, j) => {
            // Finally we can take each shape and extrude it
            const geometry = new THREE.ExtrudeGeometry(shape, {
              depth: 0.05,
              bevelEnabled: false
            });
            geometry.center()
            // Create a mesh and add it to the group
            const mesh = new THREE.Mesh(geometry, material);
            this.heartMesh = mesh;
            svgGroup.add(mesh);
          });
        });
        
        // Add our group to the scene (you'll need to create a scene)
        svgGroup.rotateX(Math.PI);
        this.scene.add(svgGroup);

        let dist = 0.6
        //lights - 01
        this.heartLamp01 = new THREE.RectAreaLight(this.config.color, 500, 0.048, 1)
        this.heartLamp01.rotateY(-Math.PI/2)
        this.heartLamp01.rotateX(-Math.PI/4)
        this.heartLamp01.translateZ(-dist);
        this.scene.add(this.heartLamp01);



        //lights - 02 
        this.heartLamp02 = new THREE.RectAreaLight(this.config.color, 500, 0.048, 1)
        this.heartLamp02.rotateY(-Math.PI/2)
        this.heartLamp02.rotateX(-3*Math.PI/4)
        this.heartLamp02.translateZ(-dist);
        this.scene.add(this.heartLamp02);

        


    }

    setupFloor() {
        const colorStageMat = new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
            flatShading: THREE.FlatShading,
            color: new THREE.Color('#000000')
        })

        const svgMarkup = `
        <svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="4" height="4" rx="0.15" fill="#C4C4C4"/>
        </svg>
        
        
        `;

        const loader = new SVGLoader();
        const svgData = loader.parse(svgMarkup);
        
        // Group that will contain all of our paths
        const svgGroup = new THREE.Group();
        
        const material = colorStageMat;
        
        // Loop through all of the parsed paths
        svgData.paths.forEach((path, i) => {
          const shapes = path.toShapes(true);
        
          // Each path has array of shapes
          shapes.forEach((shape, j) => {
            // Finally we can take each shape and extrude it
            const geometry = new THREE.ExtrudeGeometry(shape, {
              depth: 0.05,
              bevelEnabled: false
            });
            geometry.center()
            // Create a mesh and add it to the group
            const mesh = new THREE.Mesh(geometry, material);
            svgGroup.add(mesh);
          });
        });
        
        // Add our group to the scene (you'll need to create a scene)
        this.floor = svgGroup;
        this.floor.rotateX(Math.PI/2);
        this.floor.position.y = -1.7;
        this.scene.add(svgGroup);   
    }

    setupLights() {
        
        const light_1 = new THREE.DirectionalLight(0xffffff, 1);
        light_1.position.set(0, 0.3, 1);
        this.scene.add(light_1);
        
        const light_2 = new THREE.DirectionalLight(0xffffff, 1);
        light_2.position.set(0, 0, -1);
        this.scene.add(light_2);
        
        this.scene.add( new THREE.AmbientLight( 0x404040 ) );
    }
    
    setupRenderer() {
        let {width, height, aspectRatio} = this.size;
        this.renderer = new THREE.WebGLRenderer({alpha: true})

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;

        this.elm.appendChild(this.renderer.domElement);
        
    }

    setupCamera() {
        
		window.addEventListener('resize', this.onWindowResize.bind(this));
        let {width, height, aspectRatio} = this.size;
        this.camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
        this.camera.position.z =  5;

        this.oc = new OrbitControls(this.camera, this.renderer.domElement)
        // this.oc.enableRotate = false

    }
	onWindowResize() {
		this.camera.aspect = this.size.aspectRatio;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.size.width, this.size.height);

	}

    setupRenderPasses() {
        let {width, height, aspectRatio} = this.size;

        this.renderScene = new RenderPass( this.scene, this.camera );
        this.bloomPass = new UnrealBloomPass( new THREE.Vector2( innerWidth * 2, innerHeight * 2 ), this.config.bloomStrength, this.config.bloomRadius, this.config.bloomThreshold );
        this.bloomPass.threshold = this.config.bloomThreshold;
        this.bloomPass.strength = this.config.bloomStrength;
        this.bloomPass.radius = this.config.bloomRadius;

        this.composer = new EffectComposer( this.renderer );
        this.composer.addPass( this.renderScene );
        this.composer.addPass( this.bloomPass );

    }

    setupGUI() {
        this.gui = new dat.GUI();
        this.gui.add(this.config, 'floor').onChange(() => {
            if(!this.config.floor && this.floor) {
                this.scene.remove(this.floor)
            }
            else {
                this.setupFloor();
            }
        });
        this.gui.add(this.config, 'cycleColors')
        this.gui.add(this.config, 'hueSpeed', 1, 5000)


        this.gui.addColor(this.config, 'color');
        

        this.gui.add( this.config, 'exposure', 0.1, 2 ).onChange( ( value ) => {

            this.renderer.toneMappingExposure = Math.pow( value, 4.0 );

        } );

        this.gui.add( this.config, 'bloomThreshold', 0.0, 1.0 ).onChange( ( value ) => {

            this.bloomPass.threshold = Number( value );

        } );

        this.gui.add( this.config, 'bloomStrength', 0.0, 3.0 ).onChange( ( value ) => {

            this.bloomPass.strength = Number( value );

        } );

        this.gui.add( this.config, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( ( value ) => {

            this.bloomPass.radius = Number( value );

        } );
    }

    animate() {
        this.frame++;
        this.heartMesh.position.y = Math.sin(this.frame/50) / 1.5;
        this.heartLamp01.position.y = -this.heartMesh.position.y;
        this.heartLamp02.position.y = -this.heartMesh.position.y;

        // this.renderer.render( this.scene, this.camera );

        
        this.composer.render();
        if(this.config.cycleColors) {
            let confCol = new THREE.Color(this.config.color);
            let confHsl = confCol.getHSL({});
            
            let hue = (Math.sin(this.frame/(5001 - this.config.hueSpeed))/2 + 0.5).toFixed(3);
            const newCol = new THREE.Color(`hsl(${ hue * 360 }, ${Math.round(confHsl.s * 100)}%, ${Math.round(confHsl.l * 100)}%)`)

            this.heartMesh.material.color = newCol;
            this.heartLamp01.color = newCol;
            this.heartLamp02.color = newCol;
            
        } else {
            this.heartMesh.material.color = new THREE.Color(this.config.color);
            this.heartLamp01.color = new THREE.Color(this.config.color);
            this.heartLamp02.color = new THREE.Color(this.config.color);
        }


        requestAnimationFrame(this.animate.bind(this));
    }
}

new Heart(document.body).animate();