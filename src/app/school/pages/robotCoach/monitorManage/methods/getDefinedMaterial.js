import * as THREE from 'three';
import { MeshLineMaterial } from 'three.meshline';

let TEACH_LIMIT_MATERIAL = new MeshLineMaterial({
  useMap: false,
  color: new THREE.Color(0xff0606),
  opacity: 1,
  sizeAttenuation: !false,
  lineWidth: 1, //.5
});

let PRESSED_LINE_MATERIAL = new MeshLineMaterial({
  useMap: false,
  color: new THREE.Color(0xff0606),
  opacity: 1,
  sizeAttenuation: !false,
  lineWidth: 1, //.5
});

let PARK_LINE__MATERIAL = new MeshLineMaterial({
  useMap: false,
  color: new THREE.Color(0xff0606),
  opacity: 1,
  sizeAttenuation: !false,
  lineWidth: 1, //.5
});

let DYNAMIC_LINE_MATERIAL = new MeshLineMaterial({
  useMap: false,
  color: new THREE.Color(0xff0606), //红色：0xff0606 黄色：0xffb923
  opacity: 1,
  sizeAttenuation: !false,
  lineWidth: 1, //.5
});

let DLINES_WITH = 1; //1

export function getDefinedMaterial(type, color) {
  //0:教学区域 1：压线 2：库位标线
  if (type === 'TeachLimit') {
    if (color !== '0xff0606') {
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
    if (color !== '0xff0606') {
      PARK_LINE__MATERIAL = new MeshLineMaterial({
        useMap: false,
        color: new THREE.Color(color),
        opacity: 1,
        sizeAttenuation: !false,
        lineWidth: DLINES_WITH,
      });
    }
    return PARK_LINE__MATERIAL;
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
