import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as Constants from '../constants/const.js';
import * as Global from './global.js';
import { _get } from 'utils';

let Ammo;

export class Car {
  carModel = undefined;
  wheels = [];

  constructor(ammoLib, index, originData) {
    this.index = _get(originData, 'carNumber', '');
    this.originData = originData;
    Ammo = ammoLib;
    this.carGroup = new THREE.Group();
    this.carGroupWrap = new THREE.Group();
    this.wheel_fl = new THREE.Group();
    this.wheel_fr = new THREE.Group();
    this.wheel_rl = new THREE.Group();
    this.wheel_rr = new THREE.Group();

    this.cameraPosions = new THREE.Group();
    this.cameraIn = new THREE.Object3D();
    this.cameraFront = new THREE.Object3D();
    this.cameraBehind = new THREE.Object3D();
    //(0,10,-60)
    this.cameraFront.position.x = 0;
    this.cameraFront.position.y = 10;
    this.cameraFront.position.z = -60;
    this.cameraFront.name = 'cameraFront';
    this.cameraPosions.add(this.cameraFront);
    //驾驶人眼睛位置在车中(-4,10,1)
    this.cameraIn.position.x = -4;
    this.cameraIn.position.y = 10;
    this.cameraIn.position.z = 1;
    this.cameraIn.name = 'cameraIn';
    this.cameraPosions.add(this.cameraIn);
    //(0,10,60)
    this.cameraBehind.position.x = 0;
    this.cameraBehind.position.y = 10;
    this.cameraBehind.position.z = 60;
    this.cameraBehind.name = 'cameraBehind';
    this.cameraPosions.add(this.cameraBehind);
    // this.scene.add(cameraPosions)

    this.lastCarPositionX = 0;
    this.lastCarPositionY = 0;
    this.lastCarPositionZ = 0;

    this.mainCamera = new THREE.PerspectiveCamera(0, 0, 0, 0);

    this.IS_CLIMB = false; //是否处于爬坡阶段
    this.HAS_INTO_CLIMB = false; //是否已经进入爬坡阶段

    // 物理参数
    this.offsetX = 0;
    this.offsetZ = 0;
    this.offsetX2 = 0;
    this.offsetZ2 = 0;
    this.lastX = 0; //fix pos.x
    this.lastZ = 0; //fix pos.z;
    this.lastPhysX = 0;
    this.lastPhysZ = 0;

    this.moved = false;
  }

  load(path, camera, onProgress, onError) {
    const that = this;
    let config = {
      index: 0,
      x: 0,
      y: Constants.BASE_H,
      z: 0,
      rotation: 0,
      angle: 0,
      speed: 0,
      moveState: 0,
      rotationX: 0,
      rotationZ: 0,
    };
    this.car = this.generateCar(config, path, onProgress, onError);
    this.setCamera(camera);

    function update(jsObject, delta, POLYGON_RAMP_POINTS) {
      if (!jsObject || !jsObject.list) return;
      for (var i = 0; i < jsObject.list.length; i++) {
        if (that.index === jsObject.list[i].index) {
          function updateOneCar(json) {
            // 不在爬坡拦截俯仰角滚动
            let status = json;
            if (!that.HAS_INTO_CLIMB) {
              status.rotationX = 0;
              status.rotationZ = 0;
            }

            that.set(
              delta,
              status.x,
              status.y,
              status.z,
              status.rotationX,
              status.rotation,
              status.rotationZ,
              status.angle,
              status.moveState,
              status.speed,
            );
            // that.updateCamera(json.x, json.y, json.z);
            that.climb(json, POLYGON_RAMP_POINTS);
          }
          updateOneCar(jsObject.list[i]);
        }
      }
    }
    Global.updateList.push(update);
    return this;
  }

  climb(json, POLYGON_RAMP_POINTS) {
    // fix:只在坡道使用
    this.IS_CLIMB = this.isInPolygon([json.x, json.z], POLYGON_RAMP_POINTS);
    if (!this.HAS_INTO_CLIMB && this.IS_CLIMB) {
      //第一次进入爬坡 && !HAS_EXIT_CLIMB
      console.log('进入爬坡');
      this.HAS_INTO_CLIMB = true;
      let pos = new THREE.Vector3(json.x, json.y, json.z);
      this.updatePhysicsCar(pos);
    } else if (this.HAS_INTO_CLIMB && !this.IS_CLIMB) {
      //进入爬坡后，驶出爬坡
      console.log('进入爬坡后，驶出爬坡');
      this.HAS_INTO_CLIMB = false;
      this.scene.remove(this.PHYSICS_CAR_OBJECT);
      this.PHYSICS_CAR_OBJECT = null;
      Global.physicsWorld.removeRigidBody(this.PHYSICS_CAR_BODY);
      // Global.syncMap.delete(CAR_MANAGER.currentIndex);// fix
    }
  }

  isInPolygon(checkPoint, polygonPoints) {
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
  }

  updatePhysicsCar(pos) {
    var sx = 12;
    var sy = 12;
    var sz = 12;
    // new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), FIXME gjf 利用球体不产生起飞
    const carMesh = new THREE.Mesh(
      // 球体 参数：半径60  经纬度细分数40,40
      new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x3485fb, transparent: true, opacity: 0.0 }), // transparent: true, opacity: 0.0
    ); //fix
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    shape.setMargin(Constants.margin);
    if (!this.PHYSICS_CAR_OBJECT) {
      this.threeObject = carMesh;
      this.createCar(
        this.threeObject,
        shape,
        new THREE.Vector3(pos.x, pos.y + 3 + sy * 0.5, pos.z),
        Constants.ZERO_QUATERNION,
      );
    }
  }

  createCar(threeObject, physicsShape, pos, quat) {
    let mass = 10000;
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
    this.body = new Ammo.btRigidBody(rbInfo);
    this.body.setFriction(1);
    this.PHYSICS_CAR_OBJECT = threeObject;
    this.scene.add(threeObject);
    if (mass > 0) {
      this.body.setActivationState(Constants.DISABLE_DEACTIVATION);
    }
    this.PHYSICS_CAR_BODY = this.body;
    Global.physicsWorld.addRigidBody(this.body);

    var the = this;

    // 将键盘输入,物理和绘制同步
    function sync(dt) {
      if (!the.body) return; //fix
      the.offsetX = the.posX() - the.lastX; //会累积误差
      the.offsetZ = the.posZ() - the.lastZ;

      the.offsetX2 = the.posX() - the.lastPhysX; //计算虚实的差值，需要虚实的初始位置一致，现在physics的origin (0, 6, 1.2)，会飘走。。。
      the.offsetZ2 = the.posZ() - the.lastPhysZ;

      the.offsetX = the.offsetX + the.offsetX2 / 10.0; //修正
      the.offsetZ = the.offsetZ + the.offsetZ2 / 10.0;

      the.lastX = the.posX();
      the.lastZ = the.posZ();
      // console.log(dt+','+offsetX +','+offsetZ+','+offsetX2 +','+offsetZ2)
      the.body.getLinearVelocity().normalize();
      the.body.setLinearVelocity(new Ammo.btVector3(the.offsetX / dt, -5, the.offsetZ / dt));
      const ms2 = the.body.getMotionState();
      if (ms2) {
        ms2.getWorldTransform(Global.transformAux1); //把刚体的矩阵位置存放到btTransform中
        const p = Global.transformAux1.getOrigin();
        const q = Global.transformAux1.getRotation();
        the.threeObject.position.set(p.x(), p.y(), p.z());
        the.threeObject.quaternion.set(q.x(), q.y(), q.z(), q.w());

        if (the.isClimb()) {
          if (the.get()) {
            the.get().position.y = p.y() - 6;
          }
          if (Global.OPEN_PHYSICS_CAR_ANGLE) {
            const quaternion = new THREE.Quaternion(q.x(), q.y(), q.z(), q.w());
            var quat = new THREE.Quaternion(0, 0, 0, 1);
            quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (90 * Math.PI) / 180);
            quaternion.multiply(quat);
            the.getCarGroup().quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
          }
        }
        the.lastPhysX = p.x();
        the.lastPhysZ = p.z();
      }
      var speedometer = document.getElementById('speedometer');
      if (speedometer) {
        //更新速度
        var speed = 3.6 * the.body.getLinearVelocity().length();
        speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';
      }
    }

    Global.syncMap.set(this.index, sync);
  }

  setScene(scene) {
    this.scene = scene;
  }

  get() {
    return this.car;
  }

  getCarGroup() {
    return this.carGroup;
  }
  getCarGroupW() {
    return this.carGroupWrap;
  }

  setCamera(camera) {
    this.mainCamera = camera;
    // this.car.add(camera);
  }

  updateCamera(x, y, z) {
    this.controls.enabled = false;
    this.mainCamera.position.x = this.mainCamera.position.x + x - this.lastCarPositionX;
    this.mainCamera.position.y = this.mainCamera.position.y + y - this.lastCarPositionY;
    this.mainCamera.position.z = this.mainCamera.position.z + z - this.lastCarPositionZ;
    // this.controls.enabled = true;
  }

  set(delta, x, y, z, rotationX, rotationY, rotationZ, angle, moveState, speed) {
    // console.log(x+","+y+","+ z+","+ rotationX+","+rotationY+","+ rotationZ)
    this.car.position.x = x;
    this.car.position.y = y; //fix：平地上也使用gps高度
    this.car.position.z = z;

    if (this.lastCarPositionX !== x || this.lastCarPositionZ !== z) {
      this.moved = true;
    }

    this.car.rotation.y = (rotationY / 180) * Math.PI;
    this.carGroup.rotation.x = (rotationX / 180) * Math.PI; //仰角
    this.carGroup.rotation.z = (-rotationZ / 180) * Math.PI; //横滚角度
    //前轮转动
    this.wheel_fl.rotation.y = (-angle / 180) * Math.PI;
    this.wheel_fr.rotation.y = (-angle / 180) * Math.PI;
    //车轮速度
    for (let i = 0; i < this.wheels.length; i++) {
      if (moveState === 1) {
        this.wheels[i].rotation.x -= (delta * speed) / 100.0;
      } else if (moveState === 2) {
        this.wheels[i].rotation.x += (delta * speed) / 100.0;
      } else {
        this.wheels[i].rotation.x -= (delta * speed) / 100.0;
      }
    }
    //随车机位
    this.cameraPosions.position.x = x;
    this.cameraPosions.position.z = z;
    this.cameraPosions.rotation.y = (rotationY / 180) * Math.PI;

    this.lastCarPositionX = x;
    this.lastCarPositionY = y;
    this.lastCarPositionZ = z;
  }

  getCarModel() {
    return this.carModel;
  }

  position() {
    return this.car.position;
  }

  posX() {
    return this.car.position.x;
  }

  posY() {
    return this.car.position.y;
  }

  posZ() {
    return this.car.position.z;
  }

  setPosX(val) {
    this.car.position.x = val;
  }

  setPosY(val) {
    this.car.position.y = val;
  }

  setPosZ(val) {
    this.car.position.z = val;
  }

  rotY() {
    return this.car.rotation.y;
  }

  isClimb() {
    return this.IS_CLIMB;
  }

  generateCar(config, path, onProgress, onError) {
    const that = this;
    const loader = new FBXLoader();
    loader.load(
      path,
      function (object) {
        that.carModel = object;
        that.addOneModel();
        that.addTextTip();
        that.loadbody_FBX(object);
        let offset = -3.8; //车中心从车头天线位置移动到车中心位置的位移偏差
        //轮子：R_U左前;L_U右前;R_D左后;L_D右后
        that.loadfl_FBX(object.getObjectByName('R_U'), -7, 3.05, -9 + offset);
        that.loadfr_FBX(object.getObjectByName('L_U'), 7, 3.05, -9 + offset);
        that.loadrl_FBX(object.getObjectByName('R_D'), -7, 3.05, 16 + offset);
        that.loadrr_FBX(object.getObjectByName('L_D'), 7, 3.05, 16 + offset);

        // hideProgressBar();
        //
        // function hideProgressBar() {
        //     document.body.removeChild(progressBarDiv);
        // }
      },
      onProgress,
      onError,
    );
    return this.carGroupWrap;
  }

  addOneModel(object) {
    // 加一个盒子
    const boxMesh = new THREE.Mesh(
      // 球体 参数：半径60  经纬度细分数40,40
      new THREE.BoxGeometry(18, 18, 38, 1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x8885fb, transparent: true, opacity: 0.0 }), // transparent: true, opacity: 0.0 transparent: true, opacity: 0.0
    ); //fix
    boxMesh.position.set(0, 5, 0);
    console.log(this);
    boxMesh.name = this.originData.carNumber;
    this.carGroup.add(boxMesh);
  }

  // 给每一辆车加上自己的车牌名字
  addTextTip() {
    let canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    let context = canvas.getContext('2d');
    context.font = 'Bold 180px Georgia';
    context.fillStyle = '#ffffff';
    context.fillText(`${this.originData.carNumber}`, 0, 180);
    let spritelTexture = new THREE.Texture(canvas);
    spritelTexture.needsUpdate = true;
    let spriteMaterial = new THREE.SpriteMaterial({ map: spritelTexture });
    let spritel = new THREE.Sprite(spriteMaterial);
    spritel.scale.set(70, 70, 70); // 精灵图标三个方向同时扩大70倍
    spritel.position.set(0, 15, 0);
    this.carGroup.add(spritel);
  }

  loadbody_FBX(object) {
    this.carGroup.add(object);
    // this.carGroup.add(this.distRingHelper());
    this.carGroupWrap.add(this.carGroup);
  }

  //轮子：R_U左前;L_U右前;R_D左后;L_D右后
  loadfl_FBX(object, x, y, z, config) {
    var wrapper = new THREE.Group();
    wrapper.position.set(x, y, z); //y是高度，z是y方向的值
    wrapper.add(object);
    object.position.set(-x, -y, -z);
    this.wheels.push(wrapper);
    wrapper.position.set(0, 0, 0);
    this.wheel_fl.add(wrapper);
    this.wheel_fl.position.set(x, y, z);
    this.carGroup.add(this.wheel_fl);
  }

  loadfr_FBX(object, x, y, z) {
    var wrapper = new THREE.Group();
    wrapper.position.set(x, y, z);
    wrapper.add(object);
    object.position.set(-x, -y, -z);
    this.wheels.push(wrapper);
    wrapper.position.set(0, 0, 0);
    this.wheel_fr.add(wrapper);
    this.wheel_fr.position.set(x, y, z);
    this.carGroup.add(this.wheel_fr);
  }

  loadrl_FBX(object, x, y, z) {
    this.wheel_rl.position.set(x, y, z);
    this.wheel_rl.add(object);
    object.position.set(-x, -y, -z);
    this.wheels.push(this.wheel_rl);
    this.carGroup.add(this.wheel_rl);
  }

  loadrr_FBX(object, x, y, z) {
    this.wheel_rr.position.set(x, y, z);
    this.wheel_rr.add(object);
    object.position.set(-x, -y, -z);
    this.wheels.push(this.wheel_rr);
    this.carGroup.add(this.wheel_rr);
  }

  distRingHelper() {
    let RADIUS_40M = 40;
    let RADIUS_30M = 30;
    let RADIUS_20M = 20;
    let whiteMaterial = new THREE.MeshBasicMaterial({ color: 0x861d1f });
    // Rings
    // 40m ring
    const geometry40m = new THREE.RingGeometry(RADIUS_40M, RADIUS_40M + 0.6, 30, 8, 4.85, 6);
    // 30m ring
    const geometry30m = new THREE.RingGeometry(RADIUS_30M, RADIUS_30M + 0.6, 30, 8, 4.85, 6);
    geometry30m.merge(geometry40m);
    // 20m ring
    const geometry20m = new THREE.RingGeometry(RADIUS_20M, RADIUS_20M + 0.6, 30, 8, 4.85, 6);
    geometry20m.merge(geometry30m);
    // adding 40m, 30m and 20m to one mesh
    const ringMesh40_30_20m = new THREE.Mesh(geometry20m, whiteMaterial);
    // ringMesh40_30_20m.layers.set(16);
    ringMesh40_30_20m.visible = true;
    ringMesh40_30_20m.name = 'rings';
    this.rings = new THREE.Object3D();
    this.rings.add(ringMesh40_30_20m);
    // Labels
    const fontJson = require('../constants/helvetiker_regular.typeface.json');
    const font = new THREE.Font(fontJson);
    let label20m = createTextMesh('20m', font, 0.5, whiteMaterial);
    // label20m.layers.set(16);
    label20m.visible = true;
    label20m.name = 'label20m';
    let label30m = createTextMesh('30m', font, 2.2, whiteMaterial);
    // label30m.layers.set(16);
    label30m.visible = true;
    label30m.name = 'label30m';
    let label40m = createTextMesh('40m', font, 2.5, whiteMaterial);
    // label40m.layers.set(16);
    label40m.visible = true;
    label40m.name = 'label40m';
    this.rings.add(label20m);
    this.rings.add(label30m);
    this.rings.add(label40m);

    this.rings.getObjectByName('label20m').position.y = -RADIUS_20M;
    this.rings.getObjectByName('label30m').position.y = -RADIUS_30M;
    this.rings.getObjectByName('label40m').position.y = -RADIUS_40M;
    // this.rings.lookAt(this.camera.position);//fix this.CAMERA_POSITION
    this.rings.lookAt(new THREE.Vector3(0, 1, 0));
    this.rings.position.y = 3;

    // this.scene.add(this.rings);
    return this.rings;

    function createTextMesh(text, font, size, mat) {
      var shapes = font.generateShapes(text, size);
      var geometry = new THREE.ShapeBufferGeometry(shapes);
      geometry.center();
      geometry.computeBoundingBox();
      return new THREE.Mesh(geometry, mat);
    }
  }
}
