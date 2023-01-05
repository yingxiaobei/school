import { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

const style = {
  width: 512,
  height: 320, // we can control scene size by setting container dimensions
};

export default class ThreeModel extends Component {
  public requestID: any;
  public controls: any;
  public mount: any;
  public scene: any;
  public camera: any;
  public renderer: any;
  public props: any;
  public model: any;

  componentDidMount() {
    this.sceneSetup();
    this.addLights();
    this.loadTheModel();
    this.startAnimationLoop();
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  sceneSetup = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, // fov = field of view
      width / height, // aspect ratio
      0.1, // near plane
      1000, // far plane
    );
    this.camera.position.z = 100; // is used here to set some distance from a cube that is located at z = 0
    // OrbitControls allow a camera to orbit around the object
    // https://threejs.org/docs/#examples/controls/OrbitControls
    this.controls = new OrbitControls(this.camera, this.mount);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement); // mount using React ref
  };

  // Code below is taken from Three.js OBJ Loader example
  // https://threejs.org/docs/#examples/en/loaders/OBJLoader
  loadTheModel = () => {
    // instantiate a loader
    const loader = new OBJLoader();
    const foo = new MTLLoader();
    const that = this;
    foo.load(this.props.mtlUrl, (materials: any) => {
      loader.setMaterials(materials);
      // load a resource
      loader.load(
        this.props.objUrl, // resource URL relative to the /public/index.html of the app
        // called when resource is loaded
        (object: any) => {
          that.scene.add(object);

          const el = that.scene.children[3];
          // el.material.color.set('#F3302B');
          that.model = el;
        },

        (xhr: any) => {},
        // called when loading has errors
        (error: any) => {},
      );
    });
  };

  // adding some lights to the scene
  addLights = () => {
    const lights = [];

    // set color and intensity of lights
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    // place some lights around the scene for best looks and feel
    lights[0].position.set(0, 2000, 0);
    lights[1].position.set(1000, 2000, 1000);
    lights[2].position.set(-1000, -2000, -1000);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);
  };

  startAnimationLoop = () => {
    if (this.model) {
      this.model.position.x = 0;
      this.model.position.z = 0;
      this.model.rotation.y = 0;
    }

    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  handleWindowResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;

    // Note that after making changes to most of camera properties you have to call
    // .updateProjectionMatrix for the changes to take effect.
    this.camera.updateProjectionMatrix();
  };

  render() {
    return <div style={style} ref={(ref) => (this.mount = ref)} />;
  }
}
