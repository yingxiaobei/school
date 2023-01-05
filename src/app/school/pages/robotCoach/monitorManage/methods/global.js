import { MeshLineMaterial } from 'three.meshline';
import * as THREE from 'three';

export var OPEN_PHYSICS_CAR_ANGLE = false; //开启车辆物理角度
export var syncMap = new Map();
export var updateList = [];
export var physicsWorld;

export function setPhysiceWorld(world) {
  physicsWorld = world;
}

export var transformAux1;

export function setTransformAux(trans) {
  transformAux1 = trans;
}

export var rigidBodies = [];

let TEACH_LIMIT_MATERIAL = new MeshLineMaterial({
  useMap: false,
  color: new THREE.Color(0x16a05d),
  opacity: 1,
  sizeAttenuation: !false,
  lineWidth: 1,
});

let PRESSED_LINE_MATERIAL = new MeshLineMaterial({
  useMap: false,
  color: new THREE.Color(0xff0606),
  opacity: 1,
  sizeAttenuation: !false,
  lineWidth: 1,
});

let PARK_LINE_MATERIAL = new MeshLineMaterial({
  useMap: false,
  color: new THREE.Color(0xf8f840),
  opacity: 1,
  sizeAttenuation: !false,
  lineWidth: 1,
});

let TRAIL_LINE_MATERIAL = new MeshLineMaterial({
  useMap: false,
  color: new THREE.Color(0xdd5246),
  opacity: 1,
  sizeAttenuation: !false,
  lineWidth: 1,
});
let DYNAMIC_LINE_MATERIAL = new MeshLineMaterial({
  useMap: false,
  color: new THREE.Color(0xff0606),
  opacity: 1,
  sizeAttenuation: !false,
  lineWidth: 1,
});

let DLINES_WITH = 1;

export var TEACHLIMIT_PLANE_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x000000,
  flatShading: true,
  transparent: true,
  opacity: 0.5,
});

export function getDynamicPlaneMaterial(type, color) {
  if (type === 'TeachLimit') {
    if (color !== '0x16a05d') {
      TEACHLIMIT_PLANE_MATERIAL = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        flatShading: true,
        transparent: true,
        opacity: 0.5,
      });
    }
    return TEACHLIMIT_PLANE_MATERIAL;
  } else {
    return TEACHLIMIT_PLANE_MATERIAL;
  }
}
export function getDynamicLineMaterial(type, color) {
  //0:教学区域 1：压线 2：库位标线  3:轨迹线
  if (type === 'TeachLimit') {
    if (color !== '0x16a05d') {
      TEACH_LIMIT_MATERIAL = new MeshLineMaterial({
        useMap: false,
        color: new THREE.Color(color),
        opacity: 1,
        sizeAttenuation: !false,
        lineWidth: DLINES_WITH,
      });
    }
    return TEACH_LIMIT_MATERIAL;
  } else if (type === 'PressedLine') {
    if (color !== '0xff0606') {
      PRESSED_LINE_MATERIAL = new MeshLineMaterial({
        useMap: false,
        color: new THREE.Color(color),
        opacity: 1,
        sizeAttenuation: !false,
        lineWidth: DLINES_WITH,
      });
    }
    return PRESSED_LINE_MATERIAL;
  } else if (type === 'ParkLine') {
    if (color !== '0xf8f840') {
      PARK_LINE_MATERIAL = new MeshLineMaterial({
        useMap: false,
        color: new THREE.Color(color),
        opacity: 1,
        sizeAttenuation: !false,
        lineWidth: DLINES_WITH,
      });
    }
    return PARK_LINE_MATERIAL;
  } else if (type === 'TrailLine') {
    if (color !== '0xdd5246') {
      TRAIL_LINE_MATERIAL = new MeshLineMaterial({
        useMap: false,
        color: new THREE.Color(color),
        opacity: 1,
        sizeAttenuation: !false,
        lineWidth: DLINES_WITH,
      });
    }
    return TRAIL_LINE_MATERIAL;
  } else {
    if (color !== '0xff0606') {
      DYNAMIC_LINE_MATERIAL = new MeshLineMaterial({
        useMap: false,
        color: new THREE.Color(color),
        opacity: 1,
        sizeAttenuation: !false,
        lineWidth: DLINES_WITH,
      });
    }
    return DYNAMIC_LINE_MATERIAL;
  }
}
