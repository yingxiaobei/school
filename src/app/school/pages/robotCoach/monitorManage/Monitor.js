import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { MeshLine } from 'three.meshline';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import * as AmmoLib from 'three/examples/js/libs/ammo.wasm';
import * as TWEEN from '@tweenjs/tween.js';
import { CarManager } from './methods/car_manager.js';
import * as Constants from './constants/const.js';
import * as Global from './methods/global.js';
import { Scenario } from './methods/scenario.js';
import { DEFAULT_STYLE, str } from './constants';
import { _get } from 'utils';
// import CameraControls from '../node_modules/camera-controls/dist/camera-controls.module.js';

let lastflag;
let flag;
let Ammo;
const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
const gravityConstant = -9.8 * 10;
let clickRequest = false;
let MODE = { ORBIT: 0, FLY: 1, CAMERA: 2, ORIGIN_POINT: 3 };
let mode = MODE.ORIGIN_POINT;
let testTrain = true;
let CAMERA_DIST = 450; //60
let CAMERA_FLOWING_DIST = 200;
let CAMERA_MIN_DIST = 30;
let CAMERA_MAX_DIST = 400; //60
let SKYBOX_SIZE = 1200; //天空盒大小 900 1200 2000
let CAMERA_MAX_FAR = 3000;
let DYNAMIC_LINE_POINTS = [];
let DLINES_H = 0.7;
let TEXT_GROUP;
let TRANSFORM_KINEMATIC;
var tbv30;
let CAMERA_H_INCAR = 18; //10:位于车内;18:位于车顶
let IS_IN_CAR = 0; //0:在车外,默认;1:在车内
let progressBarDiv;
let progress_page;
let progress;
let progress_bar;
let progress_text;
let DayAndNightFlag = 1; //白天黑夜模式
// 鼠标输入相关
var mouseCoords = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
// 车辆系统辅助
var speedometer;
// 键盘相关
var actions = {
  acceleration: false,
  braking: false,
  left: false,
  right: false,
};
var keysActions = {
  KeyW: 'acceleration',
  KeyS: 'braking',
  KeyA: 'left',
  KeyD: 'right',
};
let CURRENT_INDEX = 1;
let CAR_MANAGER;
let delta;
const clock = new THREE.Clock();
let beforeCarNumber = 'car';

// CameraControls.install({ THREE: THREE });

class App extends Component {
  lastCarPositionX = 0;
  lastCarPositionY = 0;
  lastCarPositionZ = 0;
  lastCarStatus = {}; // 上一次所有车辆的点位
  prevTime = 0;
  inCar = 0;

  constructor(props) {
    super(props);
    this.state = {
      groundMode: window.groundMode,
      carStatus: this.props.carStatus, // this.props.carStatus // 从父组件带进来
      dynamicLines: window.dynamicLines || { data: [] },
      schoolData: window.schoolData, // || {data: []}
      cameraParam: window.cameraParam,
    };
    var w = parseInt(getQueryVariable('w'));
    var h = parseInt(getQueryVariable('h'));
    var pixelRatio = parseFloat(getQueryVariable('ratio'));
    this.winWidth = !w ? DEFAULT_STYLE.width : w;
    this.winHeight = !h ? DEFAULT_STYLE.height : h;
    this.winPixelRatio = !pixelRatio ? window.devicePixelRatio : pixelRatio;

    function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable) {
          return pair[1];
        }
      }
      return false;
    }
  }

  componentDidMount() {
    const that = this;
    this.scene = new THREE.Scene();
    //欢迎
    // this.welcome();
    AmmoLib().then(function (lib) {
      Ammo = lib;
      CAR_MANAGER = new CarManager(Ammo);
      initPhysics();
      that.initScene();
      that.scene.remove(TEXT_GROUP);
    });

    function initPhysics() {
      // Physics configuration
      const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
      const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
      const broadphase = new Ammo.btDbvtBroadphase();
      const solver = new Ammo.btSequentialImpulseConstraintSolver();
      const softBodySolver = new Ammo.btDefaultSoftBodySolver();
      Global.setPhysiceWorld(
        new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver),
      );
      Global.physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
      Global.physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));
      Global.setTransformAux(new Ammo.btTransform());
      TRANSFORM_KINEMATIC = new Ammo.btTransform();
      tbv30 = new Ammo.btVector3();
    }
  }

  initOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minPolarAngle = Math.PI * 0.056; // radians
    this.controls.maxPolarAngle = Math.PI * 0.45; // radians
    this.controls.minDistance = CAMERA_MIN_DIST;
    this.controls.maxDistance = CAMERA_MAX_DIST;
    this.controls.enablePan = false; //禁止拖拽
  }

  initOriginControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minPolarAngle = Math.PI * 0.056; // radians
    this.controls.maxPolarAngle = Math.PI * 0.45; // radians
    this.controls.minDistance = CAMERA_MIN_DIST;
    this.controls.maxDistance = CAMERA_MAX_DIST;
    this.controls.enablePan = true; //可拖拽
  }

  // initCameraControls() {
  //   this.controls = new CameraControls(this.camera, this.renderer.domElement);
  //   this.controls.clock = clock;
  //   this.controls.rotateTo(0, Math.PI * 0.25, true);
  //   this.controls.dampingFactor = 1;

  //   this.controls.minPolarAngle = Math.PI * 0.056; // radians
  //   this.controls.maxPolarAngle = Math.PI * 0.45; // radians
  //   this.controls.minDistance = CAMERA_MIN_DIST;
  //   this.controls.maxDistance = CAMERA_MAX_DIST;
  //   this.controls.enablePan = false; //禁止拖拽
  // }

  initFlyControls() {
    this.controls = new FlyControls(this.camera, this.renderer.domElement);
    this.controls.movementSpeed = 100; //设置移动的速度
    this.controls.rollSpeed = Math.PI / 6; //设置旋转速度
    this.controls.autoForward = false;
    this.controls.dragToLook = true;
  }

  initInput() {
    let speed = 0;
    const that = this;
    speedometer = document.getElementById('speedometer');
    if (speedometer) {
      speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';
    }

    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('dblclick', function (event) {
      if (testTrain) {
        // console.log('鼠标点击' + event.clientX + ',' + event.clientY);
        if (clickRequest) {
          mouseCoords.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
          clickRequest = true;
        }
        onDocumentMouseDown(event);
      }

      async function onDocumentMouseDown(event) {
        event.preventDefault();

        // var vector = new THREE.Vector3(); //三维坐标对象
        // vector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
        // vector.unproject(that.camera);
        // var raycaster = new THREE.Raycaster(that.camera.position, vector.sub(that.camera.position).normalize());
        // var intersects = raycaster.intersectObjects(that.scene.children);

        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / that.renderer.domElement?.clientWidth) * 2 - 1; //window.innerWidth
        mouse.y = -(event.clientY / that.renderer.domElement?.clientHeight) * 2 + 1; //window.innerHeight
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, that.camera);
        var intersects = raycaster.intersectObject(that.scene, true) || [];
        // console.log(that.intersects)

        // 只有点击到车并且为全屏的情况下才可以进行车辆跟随（判断先加在这里，不是一个很好的位置）FIXME
        if (intersects.length > 0 && that.props.isFullscreen) {
          var selected = intersects[0]; //取第一个物体
          // 寻找列表中对应车辆的索引号码赋值进入跟随方法
          const selectIndex = CAR_MANAGER.getAll().findIndex((item) => {
            return _get(item, 'originData.carNumber', '') === selected.object.name;
          });
          if (selectIndex === -1 || !selected.object.name) {
            return;
          } else {
            that.props.openFlowingModel(selected.object.name);
            await CAR_MANAGER.setCurrentIndex(selected.object.name);
            that.cameraChange(2);
          }
          // console.log('x坐标:' + selected.point.x);
          // console.log('y坐标:' + selected.point.y);
          // console.log('z坐标:' + selected.point.z);
        }
      }
    });
    // FIXME 调试工具
    // window.addEventListener('keydown', function keydownEvent(e) {
    //   // if (mode === MODE.FLY) return;
    //   var keysActions = {
    //     KeyW: 'acceleration',
    //     KeyS: 'braking',
    //     KeyA: 'left',
    //     KeyD: 'right',
    //   };
    //   var mockOffset = 2; //5
    //   if (keysActions[e.code]) {
    //     if (window.carStatus) {
    //       if (keysActions[e.code] === 'acceleration') {
    //         window.carStatus.list[CURRENT_INDEX - 1].speed = 1000;
    //         window.carStatus.list[CURRENT_INDEX - 1].z += mockOffset;
    //       } else if (keysActions[e.code] === 'braking') {
    //         window.carStatus.list[CURRENT_INDEX - 1].speed = -1000;
    //         window.carStatus.list[CURRENT_INDEX - 1].z -= mockOffset;
    //       } else if (keysActions[e.code] === 'left') {
    //         window.carStatus.list[CURRENT_INDEX - 1].speed = 1000;
    //         window.carStatus.list[CURRENT_INDEX - 1].x -= mockOffset;
    //       } else if (keysActions[e.code] === 'right') {
    //         window.carStatus.list[CURRENT_INDEX - 1].speed = -1000;
    //         window.carStatus.list[CURRENT_INDEX - 1].x += mockOffset;
    //       }
    //     }
    //     actions[keysActions[e.code]] = true;
    //     e.preventDefault();
    //     e.stopPropagation();
    //     return false;
    //   }
    // });
    window.addEventListener('keyup', function (e) {
      // if (mode === MODE.FLY) return;
      if (keysActions[e.code]) {
        actions[keysActions[e.code]] = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls?.dispose();

    clearInterval(this.timeId);
  }

  sceneSetup = () => {
    const width = this.mount?.clientWidth;
    const height = this.mount?.clientHeight;
    this.tmpShapes = [];

    // scene

    this.scene.background = new THREE.Color(0xffffff); //设置背景颜色 0xcce0ff

    this.scene.add(makeSkySphere('images/jiaxiao_sky.jpg', SKYBOX_SIZE));

    // camera
    console.log(width / height);
    this.camera = new THREE.PerspectiveCamera(
      75, //拍摄距离  视野角值越大，场景中的物体越小
      width / height, // aspect ratio
      0.1, //最小范围
      CAMERA_MAX_FAR, //最大范围 test
    );
    this.camera.position.set(0, CAMERA_DIST, 0);

    this.loadCarModel(this.camera);

    // lights

    this.scene.add(new THREE.AmbientLight(0x666666));
    const light = new THREE.DirectionalLight(0xdfebff, 1);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    const d = 300;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 1000;
    this.scene.add(light);

    // renderer

    this.renderer = new THREE.WebGLRenderer({
      antialias: true, //去锯齿
    });
    console.log('window.devicePixelRatio:' + window.devicePixelRatio + ',winPixelRatio:' + this.winPixelRatio);
    var devicePixelRatio = this.winPixelRatio;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(width, height);
    this.mount?.appendChild(this.renderer.domElement); // mount using React ref

    this.default_viewport = new THREE.Vector4();
    this.renderer.getCurrentViewport(this.default_viewport);

    // controls

    if (mode === MODE.ORBIT) {
      this.initOrbitControls();
    } else if (mode === MODE.CAMERA) {
      // this.initCameraControls();
    } else if (mode === MODE.ORIGIN_POINT) {
      this.initOriginControls();
    }

    // progress

    progressBarDiv = document.createElement('div');
    progressBarDiv.innerText = 'Loading...';
    progressBarDiv.style.fontSize = '3em';
    progressBarDiv.style.color = '#888';
    progressBarDiv.style.display = 'block';
    progressBarDiv.style.position = 'absolute';
    progressBarDiv.style.top = '50%';
    progressBarDiv.style.width = '100%';
    progressBarDiv.style.textAlign = 'center';

    progress_page = document.getElementById('progress_page');
    progress = document.getElementById('progress');
    progress_bar = document.getElementById('progress_bar');
    progress_text = document.getElementById('progress_text');

    console.log('start Loading');
    console.time('Download');
    // showProgressBar();
    // updateProgressBar(0);

    function showProgressBar() {
      document.body.appendChild(progressBarDiv);
    }

    function updateProgressBar(fraction) {
      progressBarDiv.innerText = 'Loading... ' + Math.round(fraction * 100, 2) + '%';
    }

    function makeSkySphere(url, ballSize) {
      const ballGeo = new THREE.SphereGeometry(ballSize, 32, 16);
      const loader = new THREE.TextureLoader();
      const texture = loader.load(url);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.encoding = THREE.sRGBEncoding;
      const ballMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
      let sphere = new THREE.Mesh(ballGeo, ballMaterial);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      sphere.position.y = 30;
      sphere.rotation.y = (90 * Math.PI) / 180;
      return sphere;
    }
  };

  updateProgressBar = (fraction) => {
    progressBarDiv.innerText = 'Loading... ' + Math.round(fraction * 100, 2) + '%';
  };

  updateProgressPage = (fraction) => {
    var percent = Math.round(fraction * 100, 2),
      orange = 30,
      yellow = 55,
      green = 85;
    progress.classList.add('progress--active');
    progress_text.getElementsByTagName('em')[0].innerText = 'Loading... ' + percent + '%';
    if (percent >= 100) {
      percent = 100;
      progress_bar.style.width = percent + '%';
      progress.classList.add('progress--complete');
      progress_bar.classList.add('progress__bar--blue');
      // progress_text.getElementsByTagName('em')[0].innerText = 'Complete';
    } else {
      if (percent >= green) {
        progress_bar.classList.add('progress__bar--green');
      } else if (percent >= yellow) {
        progress_bar.classList.add('progress__bar--yellow');
      } else if (percent >= orange) {
        progress_bar.classList.add('progress__bar--orange');
      }
      progress_bar.style.width = percent + '%';
    }
  };

  fitCamera_orbit = function (fieldCode, pos) {
    //dp 项目编号,pos车辆位置
    // console.log('fitCamera_orbit：'+fieldCode,pos)
    if (pos) {
      // if (this.lastFieldCode === undefined || fieldCode !== this.lastFieldCode) {
      const newP = { x: pos.x, y: CAMERA_DIST, z: pos.z };
      // const directPair = this.teachAreaManager.getDirectionInGarageRange(fieldCode);

      // if (directPair === undefined) return false;

      var origpos = new THREE.Vector3().copy(this.camera.position); // original position
      var origrot = new THREE.Euler().copy(this.camera.rotation); // original rotation
      var origup = new THREE.Vector3().copy(this.camera.up); // original up
      // const direction = new THREE.Vector3(directPair.x2 - directPair.x1, 0, directPair.y1 - directPair.y2).normalize()
      // this.camera.up.set(direction.x, direction.y, direction.z);
      this.camera.position.set(0, 1, 0);
      this.camera.lookAt(0, 0, 0);
      var dstrot = new THREE.Euler().copy(this.camera.rotation); //计算出最终角度
      this.camera.position.set(origpos.x, origpos.y, origpos.z); //复原位置
      this.camera.rotation.set(origrot.x, origrot.y, origrot.z); //复原角度
      this.camera.up.set(origup.x, origup.y, origup.z); //复原up方向

      this.animateCamera(this.camera, newP, dstrot, undefined);
      // this.lastFieldCode = fieldCode;
      return true;
      // }
    }
    return false;
  };
  loadCarModel = (camera) => {
    const that = this;

    function onProgress(xhr) {
      if (xhr.lengthComputable) {
        // that.updateProgressBar(xhr.loaded / xhr.total);
        that.updateProgressPage(xhr.loaded / xhr.total);
        const loadingPercentage = Math.ceil((xhr.loaded / xhr.total) * 100, 2);
        // console.log(loadingPercentage + '% downloaded');
        if (xhr.loaded === xhr.total) {
          console.log('File size: ' + (xhr.total / 1024).toFixed(2) + 'kB');
          console.timeEnd('Download');
          setTimeout(hideProgressPage, 2500);
        }
      }
    }

    function hideProgressPage() {
      progress_page.hidden = true; //fix
    }

    function onError() {
      const message = 'Error loading model';
      progressBarDiv.innerText = message;
      console.log(message);
    }
    for (let i = 0; i < _get(this, 'props.carStatus.list.length', 0); i++) {
      CAR_MANAGER.add(i + 1, this.props.carStatus.list[i]); //fix _get(this, 'props.carStatus.list.length', 0)
      console.log(this.props.carStatus.list[i]);
    }
    CAR_MANAGER.loadAll('fbx/car.fbx', that.scene, camera, onProgress, onError);
    var cars = CAR_MANAGER.getAll();
    for (var i = 0; i < cars.length; i++) {
      that.scene.add(cars[i].get());
    }
  };

  createRigidBody = (threeObject, physicsShape, mass, pos, quat, name) => {
    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    if (name === 'test') {
      // CAR_TEST_BODY = threeObject;
      body.setFriction(0.0);
    }
    threeObject.userData.physicsBody = body;
    threeObject.name = name;
    this.scene.add(threeObject);
    if (mass > 0) {
      Global.rigidBodies.push(threeObject);
      // Disable deactivation
      body.setActivationState(Constants.DISABLE_DEACTIVATION);
    }
    Global.physicsWorld.addRigidBody(body);
    return body;
  };

  isInPolygon = (checkPoint, polygonPoints) => {
    var counter = 0;
    var i;
    var xinters;
    var p1, p2;
    var pointCount = polygonPoints.length;
    p1 = polygonPoints[0];

    for (i = 1; i <= pointCount; i++) {
      p2 = polygonPoints[i % pointCount];
      if (checkPoint[0] > Math.min(p1[0], p2[0]) && checkPoint[0] <= Math.max(p1[0], p2[0])) {
        if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
          if (p1[0] !== p2[0]) {
            xinters = ((checkPoint[0] - p1[0]) * (p2[1] - p1[1])) / (p2[0] - p1[0]) + p1[1];
            if (p1[1] === p2[1] || checkPoint[1] <= xinters) {
              counter++;
            }
          }
        }
      }
      p1 = p2;
    }
    if (counter % 2 === 0) {
      return false;
    } else {
      return true;
    }
  };

  welcome = () => {
    const that = this;
    new TTFLoader().load('ttf/Calibri.ttf', function (json) {
      let text = 'Robot Coach';
      that.createText(new THREE.Font(json), text, 30);
    });
  };

  createText = (font, text, hover) => {
    const height = 2,
      size = 4, //7
      // hover = 30,//悬浮高度
      curveSegments = 4,
      bevelThickness = 0.2, //斜面厚度
      bevelSize = 0.1;
    let textGeo = new THREE.TextGeometry(text, {
      font: font,
      size: size,
      height: height,
      curveSegments: curveSegments,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelEnabled: true,
    });
    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();
    const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
    let material = new THREE.MeshPhongMaterial({ color: 0xffff03, flatShading: true });
    let textMesh1 = new THREE.Mesh(textGeo, material);
    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;
    textMesh1.rotation.x = -Math.PI / 2;

    textMesh1.rotation.y = 0;
    textMesh1.rotation.z = 0;

    TEXT_GROUP = new THREE.Group();
    TEXT_GROUP.position.x = 0;
    TEXT_GROUP.position.y = 0;
    TEXT_GROUP.position.z = 0;
    this.scene.add(TEXT_GROUP);
    TEXT_GROUP.add(textMesh1);
  };

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
    const that = this;
    this.count += 1;

    if (CAR_MANAGER.current().get()) {
      const time = performance.now();
      const deltaTime = (time - this.prevTime) / 1000.0;
      for (var i = 0; i < Global.updateList.length; i++) {
        Global.updateList[i](this.state.carStatus, deltaTime, this.scenario1.getRampRange());
      }
      this.prevTime = time;
      for (let i = 0; i < this.tmpShapes.length; i++) {
        this.scene.remove(this.tmpShapes[i]); //清除模型
        this.tmpShapes[i].material.dispose();
        this.tmpShapes[i].geometry.dispose();
        this.tmpShapes[i] = null;
      }
      this.tmpShapes.splice(0, this.tmpShapes.length);
    }

    if (this.state.dynamicLines) {
      drawDynamicLines(this.state.dynamicLines);
    }
    if (mode === MODE.CAMERA) {
      delta = this.controls.clock.getDelta();
    } else {
      delta = clock.getDelta();
    }
    updatePhysics(delta);
    processClick();

    this.scenario1.updateRollTexture();

    if (mode === MODE.ORBIT) {
      this.renderer.render(this.scene, this.camera);
    } else if (mode === MODE.CAMERA) {
      const hasControlsUpdated = this.controls.update(delta);
      this.renderer.render(this.scene, this.camera);
    } else if (mode === MODE.ORIGIN_POINT) {
      this.renderer.render(this.scene, this.camera);
    }

    // mStats.update();

    if (mode === MODE.FLY) {
      this.controls.update(delta);
    }

    TWEEN.update();

    // window.carStatus.list[CURRENT_INDEX - 1].z += 1;//todo test

    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);

    function updatePhysics(delta) {
      // Step world
      Global.physicsWorld.stepSimulation(delta, 10); //模拟运动

      // Update rigid bodies
      for (let i = 0, il = Global.rigidBodies.length; i < il; i++) {
        const objThree = Global.rigidBodies[i];
        const objPhys = objThree.userData.physicsBody;
        if (objThree.name !== 'test') {
          const ms = objPhys.getMotionState();
          if (ms) {
            ms.getWorldTransform(Global.transformAux1); //把刚体的矩阵位置存放到btTransform中
            const p = Global.transformAux1.getOrigin();
            const q = Global.transformAux1.getRotation();
            if (objThree.name === 'car') {
              objThree.position.set(p.x(), p.y() - 6, p.z());
            } else {
              objThree.position.set(p.x(), p.y(), p.z());
            }
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
          }
        }
      }
      Global.syncMap.forEach(function (func) {
        if (func) {
          func(delta);
        }
      });
    }

    function processClick() {
      if (clickRequest) {
        raycaster.setFromCamera(mouseCoords, that.camera);

        // Creates a ball
        const ballMass = 3; //0
        const ballRadius = 0.4;

        const ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 18, 16), ballMaterial);
        ball.castShadow = true;
        ball.receiveShadow = true;
        const ballShape = new Ammo.btSphereShape(ballRadius);
        ballShape.setMargin(Constants.margin);
        pos.copy(raycaster.ray.direction);
        pos.add(raycaster.ray.origin);
        quat.set(0, 0, 0, 1);
        const ballBody = that.createRigidBody(ball, ballShape, ballMass, pos, quat, undefined);
        ballBody.setFriction(0.0); //0.5

        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(14);
        ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));

        clickRequest = false;
      }
    }

    //画轨迹线
    function drawDynamicLines(jsObject) {
      if (!jsObject.dlines) return;
      for (let i = 0; i < jsObject.dlines.length; i++) {
        var type = jsObject.dlines[i].type;
        var color = jsObject.dlines[i].color;
        var points = jsObject.dlines[i].points;
        for (let i = 0; i < points.length; i++) {
          if (type !== 'TeachLimit') {
            drawDynamicLine(points[i], Global.getDynamicLineMaterial(type, color), type);
          } else {
            //教学区域绘制平面
            if (points[i].length === 5) {
              // eslint-disable-next-line no-loop-func
              function plane(points) {
                var geometry = new THREE.Geometry();
                for (let i = 0; i < 4; i++) {
                  geometry.vertices.push(new THREE.Vector3(points[i].x / 100.0, points[i].y / 100.0, DLINES_H));
                }
                geometry.faces.push(new THREE.Face3(0, 1, 2));
                geometry.faces.push(new THREE.Face3(2, 3, 0));
                let mesh = new THREE.Mesh(geometry, Global.getDynamicPlaneMaterial(type, color));
                mesh.lookAt(new THREE.Vector3(0, 1, 0));
                that.scene.add(mesh);
                that.tmpShapes.push(mesh);
              }

              plane(points[i]);
            }
          }
        }
        if (jsObject.point) {
          that.scenario1.updateRollPlane(
            CAR_MANAGER.current().get().position,
            new THREE.Vector3(jsObject.point.x / 100.0, 1.0, -jsObject.point.y / 100.0),
          );
        }
      }
    }

    //画轨迹线
    function drawDynamicLine(points, material, type) {
      //使用MeshLine
      DYNAMIC_LINE_POINTS.splice(0, DYNAMIC_LINE_POINTS.length);
      for (let i = 0; i < points.length; i++) {
        DYNAMIC_LINE_POINTS.push(points[i].x / 100.0, 1.0, -points[i].y / 100.0);
      }
      var line = new MeshLine();
      line.setPoints(DYNAMIC_LINE_POINTS);
      const mesh = new THREE.Mesh(line, material);
      if (type === 'TrailLine') {
        mesh.position.y = DLINES_H + 0.3;
      } else {
        mesh.position.y = DLINES_H;
      }
      that.scene.add(mesh);
      that.tmpShapes.push(mesh);
      line.dispose(); //清除存储模型的变量
      line = null;
      return mesh;
    }
  };

  handleWindowResize = () => {
    const width = this.mount?.clientWidth;
    const height = this.mount?.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;

    // Note that after making changes to most of camera properties you have to call
    // .updateProjectionMatrix for the changes to take effect.
    this.camera.updateProjectionMatrix();
  };

  cameraChange(isInCar) {
    if (isInCar === 0) {
      console.log('切换到车内');
      //相机位置 驾驶人眼睛位置在车中(-4,10,1)，离车中心距离为4.12,角度为-194
      this.camera.position.x =
        CAR_MANAGER.current().posX() + 4.12 * Math.cos(-3.4 - (CAR_MANAGER.current().rotY() / 180) * Math.PI); //camera.position.x是摄像机在车左右方向距离
      this.camera.position.y = CAR_MANAGER.current().posY() + CAMERA_H_INCAR; //camera.position.y是摄像机的高度
      this.camera.position.z =
        CAR_MANAGER.current().posZ() + 4.12 * Math.sin(-3.4 - (CAR_MANAGER.current().rotY() / 180) * Math.PI); //camera.position.z是摄像机车尾方向距离
      //相机朝向
      this.camera.rotation.x = 0; //摄像机朝上朝下
      this.camera.rotation.y = (CAR_MANAGER.current().rotY() / 180) * Math.PI; //摄像机前后向旋转
      this.camera.rotation.z = 0; //摄像机手部旋转
      this.camera.aspect = 1.6;
      this.inCar = 1;
    } else if (isInCar === 1) {
      console.log('切换到俯视');
      this.restoreCameraDefault();
      this.inCar = 0;
    } else if (isInCar === 2) {
      console.log('切换到车后');
      this.camera.position.x =
        CAR_MANAGER.current().posX() + CAMERA_FLOWING_DIST * Math.sin((CAR_MANAGER.current().rotY() / 180) * Math.PI);
      this.camera.position.y = CAR_MANAGER.current().posY() + 50;
      this.camera.position.z =
        CAR_MANAGER.current().posZ() + CAMERA_FLOWING_DIST * Math.cos((CAR_MANAGER.current().rotY() / 180) * Math.PI);
      this.camera.rotation.x = 0; //摄像机朝上朝下
      this.camera.rotation.y = (CAR_MANAGER.current().rotY() / 180) * Math.PI; //摄像机前后向旋转
      this.camera.rotation.z = 0; //摄像机手部旋转
      this.inCar = 0;
    } else if (isInCar === 3) {
      console.log('切换全景模式');
      this.controls.enabled = false;
      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.camera.position.z = 0;
      //相机朝向
      this.camera.rotation.x = 0; //摄像机朝上朝下
      this.camera.rotation.y = 0; //摄像机前后向旋转
      this.camera.rotation.z = 0; //摄像机手部旋转
      this.camera.aspect = 1.6;
    }
  }

  restoreCameraDefault() {
    if (mode === MODE.CAMERA) {
      this.controls.rotateTo(0, 0, true);
      this.controls.setPosition(CAR_MANAGER.current().posX(), CAMERA_DIST, CAR_MANAGER.current().posZ(), true);
    } else if (mode === MODE.ORBIT) {
      this.camera.position.set(CAR_MANAGER.current().posX(), CAMERA_DIST, CAR_MANAGER.current().posZ());
      this.camera.rotation.x = (-90 / 180) * Math.PI; //摄像机朝上朝下
      this.camera.rotation.y = 0; //摄像机前后向旋转
      this.camera.rotation.z = 0; //摄像机手部旋转
    } else if (mode === MODE.ORIGIN_POINT) {
      this.controls.rotateTo(0, 0, true);
      this.camera.position.set(0, CAMERA_DIST, 0);
      this.camera.rotation.x = (-90 / 180) * Math.PI; //摄像机朝上朝下
      this.camera.rotation.y = 0; //摄像机前后向旋转
      this.camera.rotation.z = 0; //摄像机手部旋转
    }
  }

  /**
   * oldP 相机当前的位置
   * oldT 相机的controls的target
   * newP 新相机的目标位置
   * newT 新的controls的target
   * 动画结束时的回调函数
   * */
  animateCamera = (oldP, oldT, newP, newT, callBack) => {
    const that = this;
    var tween = new TWEEN.Tween({
      x1: oldP.x, // 相机x
      y1: oldP.y, // 相机y
      z1: oldP.z, // 相机z
      x2: oldT.x, // 控制点的中心点x
      y2: oldT.y, // 控制点的中心点y
      z2: oldT.z, // 控制点的中心点z
    });
    tween.to(
      {
        x1: newP.x,
        y1: newP.y,
        z1: newP.z,
        x2: newT.x,
        y2: newT.y,
        z2: newT.z,
      },
      1000,
    );
    tween.onUpdate(function (object) {
      that.camera.position.x = object.x1;
      that.camera.position.y = object.y1;
      that.camera.position.z = object.z1;
      that.controls.target.x = object.x2;
      that.controls.target.y = object.y2;
      that.controls.target.z = object.z2;
      that.controls.update();
    });
    tween.onComplete(function () {
      that.controls.enabled = true;
      callBack && callBack();
    });
    tween.easing(TWEEN.Easing.Cubic.InOut);
    tween.start();
  };

  testDayAndNight() {
    if (DayAndNightFlag === 0) {
      //0白天;1黑夜
      DayAndNightFlag = 1;
    } else {
      DayAndNightFlag = 0;
    }
    this.scenario1.changeDayAndNight(DayAndNightFlag);
  }

  testChangeCar() {
    if (CURRENT_INDEX === 1) {
      CURRENT_INDEX = 2;
    } else {
      CURRENT_INDEX = 1;
    }
    CAR_MANAGER.setCurrentIndex(CURRENT_INDEX);
  }

  testclick() {
    if (testTrain) {
      testTrain = false;
    } else {
      testTrain = true;
    }
  }

  testRoam() {
    // eslint-disable-next-line default-case
    switch (mode) {
      case MODE.FLY:
        this.initOrbitControls();
        mode = MODE.ORBIT;
        break;
      case MODE.ORBIT:
        this.initFlyControls();
        mode = MODE.FLY;
        break;
      case MODE.ORIGIN_POINT:
        this.initOriginControls();
        mode = MODE.ORIGIN_POINT;
        break;
    }
  }

  testCarPhyAngle() {
    Global.OPEN_PHYSICS_CAR_ANGLE = !Global.OPEN_PHYSICS_CAR_ANGLE;
  }

  testChangeCamera() {
    // this.cameraChange(this.inCar);
    this.restoreCameraDefault();
  }

  testLineFromPoint = (x, y) => {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(x, 0.0, -y));
    geometry.vertices.push(new THREE.Vector3(x, 20.0, -y));
    var line = new THREE.Line(geometry, Constants.FORBIDLINE_ERROR_MATERAIL);
    line.computeLineDistances();
    this.scene.add(line);
  };
}

App.prototype.initScene = function () {
  this.count = 0;
  this.sceneSetup();
  this.scenario1 = new Scenario(this, Ammo);
  this.scenario1.initMaterial();
  console.log(this.props.str);
  var json = JSON.parse(this.props.str);
  this.scenario1.updateScene(json);
  this.prevTime = performance.now();
  this.startAnimationLoop();
  this.initInput();

  this.timeId = setInterval(() => {
    this.setState({
      groundMode: {
        ...window.groundMode,
      },
      cameraParam: {
        ...window.cameraParam,
      },
      carStatus: {
        ...this.props.carStatus,
        // ...window.carStatus, FIXME
      },
      dynamicLines: {
        ...window.dynamicLines,
      },
      schoolData: {
        ...window.schoolData,
      },
    });
    const that = this;
    // 如果平移到地下立刻归位相机 (穿模保护)
    if (that.camera.position.y < 0) {
      resetOriginCamera();
    }
    if (!(this.props.carNumber === beforeCarNumber)) {
      beforeCarNumber = this.props.carNumber;
      const selectIndex = CAR_MANAGER.getAll().findIndex((item) => {
        return _get(item, 'originData.carNumber', '') === this.props.carNumber;
      });
      if (selectIndex === -1 || !this.props.carNumber) {
      } else {
        console.log('有了');
        CAR_MANAGER.setCurrentIndex(this.props.carNumber);
        that.cameraChange(2);
        mode = MODE.ORBIT;
      }
    }
    // 获取当前选择的车辆号码
    const carIndex = _get(this, 'state.carStatus.list', []).findIndex((item) => {
      return _get(item, 'carNumber', '') === this.props.carNumber;
    });

    if (this.state.carStatus.list) {
      // 是否开启车辆更随
      if (this.props.isFlowingCar) {
        if (mode === MODE.ORBIT) {
          console.log('ORBIT');
          // 带入carIndex索引相机聚焦到哪一辆车
          updateCamera(
            this.state.carStatus.list[carIndex].x,
            this.state.carStatus.list[carIndex].y,
            this.state.carStatus.list[carIndex].z,
            carIndex,
          );
        } else if (mode === MODE.CAMERA) {
          adjustCamera(
            this.state.carStatus.list[carIndex].x,
            this.state.carStatus.list[carIndex].y,
            this.state.carStatus.list[carIndex].z,
          );
        }
      } else {
        if (!(mode === MODE.ORIGIN_POINT)) {
          mode = MODE.ORIGIN_POINT;
          resetOriginCamera();
        }
      }
    }

    // 归位相机
    function resetOriginCamera() {
      console.log('相机复位');
      CAR_MANAGER.setCurrentIndex('');
      that.camera.position.set(0, CAMERA_DIST, 0);
      that.camera.rotation.x = (-90 / 180) * Math.PI; //摄像机朝上朝下
      that.camera.rotation.y = 0; //摄像机前后向旋转
      that.camera.rotation.z = 0; //摄像机手部旋转
      that.controls.target = new THREE.Vector3(0, 0, 0);
    }

    // BUGFIX 保存所有车的位置并更新相机的位置
    function updateCamera(x, y, z, carIndex) {
      flag = (that.camera.position.x > x) & (that.camera.position.z > z);
      if (flag !== lastflag) {
        console.log('逆转');
        lastflag = flag;
        return;
      } else {
        // console.log("原角度")
        lastflag = flag;
      }
      if (!_get(that.lastCarStatus, 'list')) {
        that.lastCarStatus = that.state.carStatus;
      }
      that.controls.enabled = false;

      that.camera.position.x += x - that.lastCarStatus.list[carIndex].x; // FIXME
      that.camera.position.y += y - that.lastCarStatus.list[carIndex].y;
      that.camera.position.z += z - that.lastCarStatus.list[carIndex].z;
      that.lastCarStatus = that.state.carStatus;
      that.controls.enabled = true;
    }

    function adjustCamera(x, y, z) {
      if (CAR_MANAGER.current().moved === true) {
        that.controls.setTarget(x, y - 0.02, z); //`setLookAt` without position, Stay still at the position.
        that.controls.moveTo(x, y, z); //Move `target` position to given point.
        let dist = that.camera.position.distanceTo(CAR_MANAGER.current().position());
        if (dist > 99) {
          that.controls.dolly(dist - 100);
        }
        CAR_MANAGER.current().moved = false;
      }

      if (that.camera.position.y < 0.7) {
        that.camera.position.y = 0.7;
        let dp = CAR_MANAGER.current().position();
        that.controls.setTarget(dp.x, dp.y - 0.02, dp.z);
        that.controls.moveTo(dp.x, dp.y, dp.z);
      }
    }

    if (mode === MODE.ORBIT) {
      if (this.inCar === 0) {
        //车外
        console.log('车外');
        this.controls.target = new THREE.Vector3(CAR_MANAGER.current().posX(), 0, CAR_MANAGER.current().posZ());
        this.controls.target = new THREE.Vector3(CAR_MANAGER.current().posX(), 0, CAR_MANAGER.current().posZ());
      } else if (this.inCar === 1) {
        //车内
        console.log('车内');
        this.controls.target = new THREE.Vector3(
          CAR_MANAGER.current().posX() + 4.12 * Math.cos(-3.4 - (CAR_MANAGER.current().rotY() / 180) * Math.PI) + 0.01,
          CAR_MANAGER.current().posY() + CAMERA_H_INCAR + 0.01,
          CAR_MANAGER.current().posZ() + 4.12 * Math.sin(-3.4 - (CAR_MANAGER.current().rotY() / 180) * Math.PI) + 0.01,
        );
      } else if (this.inCar === 3) {
        // 全景
        this.controls.target = new THREE.Vector3(0, 0, 0);
      }
    }

    //切换场景
    if (this.state.schoolData.itemDatas) {
      console.log('切换场景');
      window.schoolData = {}; // 下次不执行
      // this.updateScene(this.state.schoolData)
      this.scenario1.updateScene(this.state.schoolData);
    }
    // 恢复默认视角
    if (this.state?.cameraParam?.isInCar !== IS_IN_CAR) {
      console.log('恢复默认视角');
      IS_IN_CAR = this.state.cameraParam.isInCar;
      this.restoreCameraDefault();
    }
    //切换白天夜晚
    if (this.state?.groundMode?.dayornight !== DayAndNightFlag) {
      if (this.state?.groundMode?.dayornight === 0) {
        //0白天;1黑夜
        DayAndNightFlag = 0;
      } else {
        DayAndNightFlag = 1;
      }
      this.scenario1?.changeDayAndNight(DayAndNightFlag);
    }
  }, 100);
};

App.prototype.render = function () {
  const style = {
    position: 'relative',
    width: this.winWidth,
    height: this.winHeight,
  };
  return (
    <div style={style} ref={(mount) => (this.mount = mount)}>
      <div
        id="progress_page"
        style={{
          position: 'absolute',
          width: this.winWidth,
          height: this.winHeight,
        }}
        className="progress__bar--orange"
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            width: this.winWidth,
            height: this.winHeight,
            textAlign: 'center',
          }}
        >
          <h1 style={{ color: 'white' }}>机 器 人 教 练 加 载 中 ...</h1>
        </div>
        <div style={{ position: 'absolute', left: '0', top: '80%', width: this.winWidth }}>
          <div id="progress" className="progress">
            <b id="progress_bar" className="progress__bar">
              <span id="progress_text" className="progress__text">
                Progress: <em id="progress_val">0%</em>
              </span>
            </b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default class Container extends React.Component {
  state = { isMounted: true };

  render() {
    const { isMounted = true } = this.state;
    return (
      <>
        {isMounted && (
          <App
            str={this.props.str}
            carStatus={this.props.carStatus}
            onProgress={(loadingPercentage) => this.setState({ loadingPercentage })}
            openFlowingModel={this.props.openFlowingModel}
            isFlowingCar={this.props.isFlowingCar}
            carNumber={this.props.carNumber}
            isFullscreen={this.props.isFullscreen}
          />
        )}
      </>
    );
  }
}
