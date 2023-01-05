import * as THREE from 'three';
import * as Constants from '../constants/const.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as Global from './global';
import { MeshLine } from 'three.meshline';
import { bladeHeight, grassFragmentSource, grassVertexSource, groundVertexPrefix } from '../constants';

import * as THREEx from '../utils/FastGrass';
import { randomPointsInGeometry } from '../utils/monitor';
let Ammo;

export class Scenario {
  constructor(app, ammoLib) {
    this.app = app;
    this.scene = app.scene;
    Ammo = ammoLib;
    this.AREA_TRAIN = undefined;
    this.REMOVE_OBJECTS = [];
    this.POLYGON_POINTS_AREA = []; //驾校场地范围
    this.POLYGON_RAMP_POINTS = []; //爬坡阶段检测范围

    this.pos = new THREE.Vector3();
    this.quat = new THREE.Quaternion();

    this.brickRoadMesh = undefined;
    this.obstacleUp = undefined;
    this.obstacleTop = undefined;
    this.obstacleDown = undefined;

    this.ROADSIGN_DIRECTORRIGHT_MATERIAL = undefined;
    this.ROADSIGN_DIRECT_MATERIAL = undefined;
    this.ROADSIGN_RIGHT_MATERIAL = undefined;
    this.ROADSIGN_LEFT_MATERIAL = undefined;
    this.ROADSIGN_DIRECTORLEFT_MATERIAL = undefined;
    this.ROADSIGN_RIGHTBACK_MATERIAL = undefined;
    this.ROADSIGN_LEFTBACK_MATERIAL = undefined;
    this.GRASS_LIGHT_MATERIAL = undefined; //草地
    this.GRASS_LIGHT_MATERIAL2 = undefined;
    this.BRICK_STONE_MATERIAL_DAY = undefined;
    this.BRICK_STONE_MATERIAL_DAY2 = undefined;
    this.BRICK_STONE_MATERIAL_NIGHT = undefined;
    this.BRICK_STONE_MATERIAL_NIGHT2 = undefined;
    this.BASE_GROUND_MATERIAL = undefined;

    this.RollMat = undefined;
    this.RollGEOMETRY = new THREE.PlaneGeometry(40, 20);
    this.RollTexture = undefined;
    this.Rollposition = undefined;
    this.Rollorientation = new THREE.Matrix4(); //a new orientation matrix to offset pivot
    this.RolloffsetRotation = new THREE.Matrix4(); //a matrix to fix pivot rotation
    this.ARROW = undefined;

    this.dashSize = 6;
    this.gapSize = 3;
    this.hasRoadSignDatas = true;

    // 路面标志
    this.RoadSignGEOMETRY = new THREE.PlaneGeometry(40, 20);
    this.ROADSIGN = undefined;
    this.RoadSignposition = undefined;
    this.RoadSignorientation = new THREE.Matrix4(); //a new orientation matrix to offset pivot
    this.RoadSignoffsetRotation = new THREE.Matrix4(); //a matrix to fix pivot rotation
  }

  drawStaticLine_Array = (points, material) => {
    //使用MeshLine
    let v3Points = [];
    for (let i = 0; i < points.length; i++) {
      v3Points.push(points[i][0], 1.0, points[i][1]);
    }
    v3Points.push(points[0][0], 1.0, points[0][1]); //loop
    var line = new MeshLine();
    line.setPoints(v3Points);
    const mesh = new THREE.Mesh(line, material);
    this.scene.add(mesh);
    line.dispose(); //清除存储模型的变量
    line = null;
  };

  drawStaticDashLines = (itemID, points, material, dashScale, dashSize, gapSize) => {
    for (let i = 0; i < points.length - 1; i++) {
      this.drawDashLineSegment(points[i], points[i + 1], material, dashScale, dashSize, gapSize);
    }
    if (!this.hasRoadSignDatas) {
      //在没有路标的情况下,自动生成部分路标
      if (material === Constants.FORBIDLINE_CLOUD_MATERAIL && itemID === '20600') {
        // 曲线行驶项目云线
        // fix 计算法线延长线上的点
        let center = points[0]
          .clone()
          .add(points[points.length - 1])
          .divideScalar(2);
        let normal = points[0]
          .clone()
          .sub(points[points.length - 1])
          .normalize();
        let perpendicular = new THREE.Vector3(-normal.z, 0, normal.x); //垂直向量
        let distance = points[0].distanceTo(points[points.length - 1]);
        let offset = distance / 1.5;
        let len = distance / 2.0;
        center.x += perpendicular.x * offset;
        center.y += perpendicular.y * offset;
        center.z += perpendicular.z * offset;
        let directPoint = new THREE.Vector3(
          center.x + perpendicular.x * len,
          center.y + perpendicular.y * len,
          center.z + perpendicular.z * len,
        );
        this.addRoadSign(center, directPoint, this.getRoadSignMaterial('roadSign_direct'));
      }
    }
  };
  drawDashLineSegment = (vstart, vend, material, dashScale, dashSize, gapSize) => {
    var distance = vstart.distanceTo(vend);
    var tmp = this.getLenVcetor(vstart, vend, dashSize);
    this.drawLine(vstart, tmp, material);
    for (let len = dashSize + gapSize; len < distance; len = len + dashSize + gapSize) {
      var v1 = this.getLenVcetor(vstart, vend, len);
      var v2 = this.getLenVcetor(vstart, vend, len + dashSize > distance ? distance : len + dashSize);
      this.drawLine(v1, v2, material);
    }
  };
  getLenVcetor = (v1, v2, len) => {
    let v1v2Len = v1.distanceTo(v2);
    let alpha = len / v1v2Len;
    let result = new THREE.Vector3();
    result.x = (v2.x - v1.x) * alpha + v1.x;
    result.y = (v2.y - v1.y) * alpha + v1.y;
    result.z = (v2.z - v1.z) * alpha + v1.z;
    return result;
  };
  drawStaticLines = (points, material) => {
    for (let i = 0; i < points.length - 1; i++) {
      this.drawLine(points[i], points[i + 1], material);
    }
  };

  drawLine = (vstart, vend, material) => {
    var distance = vstart.distanceTo(vend);
    var geometry = new THREE.PlaneGeometry(distance, 1.0); // fix 场地宽1分米
    var mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'staticLine';
    var pos = vend.clone().add(vstart).divideScalar(2);
    var orientation = new THREE.Matrix4();
    var offset = new THREE.Matrix4();
    orientation.lookAt(vstart, vend, new THREE.Vector3(0, 0, 1)); //look at destination
    offset.makeRotationY(Math.PI * 0.5);
    orientation.multiply(offset); //combine orientation with rotation transformations
    mesh.applyMatrix4(orientation);
    mesh.position.set(pos.x, pos.y + 0.5, pos.z);
    this.scene.add(mesh);
  };

  createGrass = (json) => {
    const that = this;
    //Variables for blade mesh
    var joints = 4;
    var bladeWidth = 0.12;
    // var bladeHeight = 1;

    //Patch side length
    var width = 120;
    //Number of vertices on ground plane side
    var resolution = 32;
    //Distance between two ground plane vertices
    var delta = width / resolution;
    //Radius of the sphere onto which the ground plane is bended
    var radius = 120;
    //User movement speed
    // var speed = 1.5;//fix

    //The global coordinates
    //The geometry never leaves a box of width*width around (0, 0)
    //But we track where in space the camera would be globally
    var pos = new THREE.Vector2(0, 0);

    //Number of blades
    var instances = 40000;
    // if (mobile) {
    instances = 7000;
    width = 50;
    // }

    //Sun
    //Height over horizon in range [0, PI/2.0]
    var elevation = 0.25;
    //Rotation around Y axis in range [0, 2*PI]
    var azimuth = 2.0;

    // var fogFade = 0.005; //fix

    //Lighting variables for grass
    var ambientStrength = 0.6;
    var translucencyStrength = 1.4;
    var specularStrength = 0.5;
    var diffuseStrength = 2.2;
    var shininess = 256;
    var sunColour = new THREE.Vector3(1.0, 1.0, 1.0);
    var specularColour = new THREE.Vector3(1.0, 1.0, 1.0);

    //************** Ground **************
    //Ground material is a modification of the existing THREE.MeshPhongMaterial rather than one from scratch
    var groundBaseGeometry = new THREE.PlaneBufferGeometry(width, width, resolution, resolution);
    groundBaseGeometry.lookAt(new THREE.Vector3(0, 1, 0));
    groundBaseGeometry.verticesNeedUpdate = true;

    var groundGeometry = new THREE.PlaneBufferGeometry(width, width, resolution, resolution);
    groundGeometry.addAttribute('basePosition', groundBaseGeometry.getAttribute('position'));
    groundGeometry.lookAt(new THREE.Vector3(0, 1, 0));
    groundGeometry.verticesNeedUpdate = true;
    var groundMaterial = new THREE.MeshPhongMaterial({ color: 0x414033 }); //0x000300
    // var groundMaterial = new THREE.MeshBasicMaterial({color: 0x414033});//0x000300

    // var groundShader;//fix
    groundMaterial.onBeforeCompile = function (shader) {
      shader.uniforms.delta = { value: delta };
      shader.uniforms.posX = { value: pos.x };
      shader.uniforms.posZ = { value: pos.z };
      shader.uniforms.radius = { value: radius };
      shader.uniforms.width = { value: width };
      shader.vertexShader = groundVertexPrefix + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `//https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
                              pos.x = basePosition.x - mod(mod((delta*posX),delta) + delta, delta);
                              pos.z = basePosition.z - mod(mod((delta*posZ),delta) + delta, delta);
                              pos.y = max(0.0, placeOnSphere(pos)) - radius;
                              //pos.y += 10.0*getYPosition(vec2(basePosition.x+delta*floor(posX), basePosition.z+delta*floor(posZ)));
                              vec3 objectNormal = getNormal(pos);
                        #ifdef USE_TANGENT
                              vec3 objectTangent = vec3( tangent.xyz );
                        #endif`,
      );
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = vec3(pos);`);
      // groundShader = shader;
    };

    // var ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // ground.geometry.computeVertexNormals();
    // ground.scale.set(20, 3, 3);
    // ground.position.y = 8;
    // ground.position.z = 410;
    // this.scene.add(ground);

    //************** Grass **************
    //Define base geometry that will be instanced. We use a plane for an individual blade of grass
    var grassBaseGeometry = new THREE.PlaneBufferGeometry(bladeWidth, bladeHeight, 1, joints);
    grassBaseGeometry.translate(0, bladeHeight / 2, 0);

    //Define the bend of the grass blade as the combination of three quaternion rotations
    let vertex = new THREE.Vector3();
    let quaternion0 = new THREE.Quaternion();
    let quaternion1 = new THREE.Quaternion();
    let x, y, z, w, angle, sinAngle; //rotationAngle

    //Rotate around Y
    angle = 0.05;
    sinAngle = Math.sin(angle / 2.0);
    var rotationAxis = new THREE.Vector3(0, 1, 0);
    x = rotationAxis.x * sinAngle;
    y = rotationAxis.y * sinAngle;
    z = rotationAxis.z * sinAngle;
    w = Math.cos(angle / 2.0);
    quaternion0.set(x, y, z, w);

    //Rotate around X
    angle = 0.3;
    sinAngle = Math.sin(angle / 2.0);
    rotationAxis.set(1, 0, 0);
    x = rotationAxis.x * sinAngle;
    y = rotationAxis.y * sinAngle;
    z = rotationAxis.z * sinAngle;
    w = Math.cos(angle / 2.0);
    quaternion1.set(x, y, z, w);

    //Combine rotations to a single quaternion
    quaternion0.multiply(quaternion1);

    //Rotate around Z
    angle = 0.1;
    sinAngle = Math.sin(angle / 2.0);
    rotationAxis.set(0, 0, 1);
    x = rotationAxis.x * sinAngle;
    y = rotationAxis.y * sinAngle;
    z = rotationAxis.z * sinAngle;
    w = Math.cos(angle / 2.0);
    quaternion1.set(x, y, z, w);

    //Combine rotations to a single quaternion
    quaternion0.multiply(quaternion1);

    let quaternion2 = new THREE.Quaternion();

    //Bend grass base geometry for more organic look
    for (let v = 0; v < grassBaseGeometry.attributes.position.array.length; v += 3) {
      quaternion2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      vertex.x = grassBaseGeometry.attributes.position.array[v];
      vertex.y = grassBaseGeometry.attributes.position.array[v + 1];
      vertex.z = grassBaseGeometry.attributes.position.array[v + 2];
      let frac = vertex.y / bladeHeight;
      quaternion2.slerp(quaternion0, frac);
      vertex.applyQuaternion(quaternion2);
      grassBaseGeometry.attributes.position.array[v] = vertex.x;
      grassBaseGeometry.attributes.position.array[v + 1] = vertex.y;
      grassBaseGeometry.attributes.position.array[v + 2] = vertex.z;
    }

    grassBaseGeometry.computeFaceNormals();
    grassBaseGeometry.computeVertexNormals();
    // var baseMaterial = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
    // var baseBlade = new THREE.Mesh(grassBaseGeometry, baseMaterial);
    //Show grass base geometry
    //scene.add(baseBlade);

    var instancedGeometry = new THREE.InstancedBufferGeometry();
    instancedGeometry.index = grassBaseGeometry.index;
    instancedGeometry.attributes.position = grassBaseGeometry.attributes.position;
    instancedGeometry.attributes.uv = grassBaseGeometry.attributes.uv;
    instancedGeometry.attributes.normal = grassBaseGeometry.attributes.normal;
    // Each instance has its own data for position, orientation and scale
    var indices = [];
    var offsets = [];
    var scales = [];
    var halfRootAngles = [];
    //For each instance of the grass blade
    for (let i = 0; i < instances; i++) {
      indices.push(i / instances);
      //Offset of the roots
      let x = Math.random() * width - width / 2;
      let z = Math.random() * width - width / 2;
      let y = 0;
      offsets.push(x, y, z);
      //Random orientation
      let angle = Math.PI - Math.random() * (2 * Math.PI);
      halfRootAngles.push(Math.sin(0.5 * angle), Math.cos(0.5 * angle));
      //Define variety in height
      if (i % 3 !== 0) {
        scales.push(2.0 + Math.random() * 1.25);
      } else {
        scales.push(2.0 + Math.random());
      }
    }
    var offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3);
    var scaleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(scales), 1);
    var halfRootAngleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngles), 2);
    var indexAttribute = new THREE.InstancedBufferAttribute(new Float32Array(indices), 1);
    instancedGeometry.setAttribute('offset', offsetAttribute);
    instancedGeometry.setAttribute('scale', scaleAttribute);
    instancedGeometry.setAttribute('halfRootAngle', halfRootAngleAttribute);
    instancedGeometry.setAttribute('index', indexAttribute);
    //Get alpha map and blade texture
    //These have been taken from "Realistic real-time grass rendering" by Eddie Lee, 2010
    var loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    var texture = loader.load('grass/blade_diffuse.jpg');
    var alphaMap = loader.load('grass/blade_alpha.jpg');
    //Define the material, specifying attributes, uniforms, shaders etc.
    var grassMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        time: { type: 'float', value: 0 },
        delta: { type: 'float', value: delta },
        posX: { type: 'float', value: pos.x },
        posZ: { type: 'float', value: pos.z },
        radius: { type: 'float', value: radius },
        width: { type: 'float', value: width },
        map: { value: texture },
        alphaMap: { value: alphaMap },
        sunDirection: {
          type: 'vec3',
          value: new THREE.Vector3(Math.sin(azimuth), Math.sin(elevation), -Math.cos(azimuth)),
        },
        // cameraPosition: {type: 'vec3', value: this.camera.position},
        ambientStrength: { type: 'float', value: ambientStrength },
        translucencyStrength: { type: 'float', value: translucencyStrength },
        diffuseStrength: { type: 'float', value: diffuseStrength },
        specularStrength: { type: 'float', value: specularStrength },
        shininess: { type: 'float', value: shininess },
        lightColour: { type: 'vec3', value: sunColour },
        specularColour: { type: 'vec3', value: specularColour },
      },
      vertexShader: grassVertexSource,
      fragmentShader: grassFragmentSource,
      side: THREE.DoubleSide,
    });
    //草
    var grass = new THREE.Mesh(instancedGeometry, grassMaterial);
    grass.name = 'grass';
    grass.scale.set(1.2, 1.2, 1.2);
    //平地
    var ground = new THREE.Mesh(groundGeometry, that.GRASS_LIGHT_MATERIAL2); //groundMaterial
    ground.geometry.computeVertexNormals();
    ground.scale.set(1.2, 1.2, 1.2);

    addGrass(grass, 127 - 90, 4, 116);
    addGrassGround(ground, 127 - 90, 4, 116);
    addGrass(grass, 127, 4, 116);
    addGrassGround(ground, 127, 4, 116);
    addGrass(grass, 127 + 90, 4, 116);
    addGrassGround(ground, 127 + 90, 4, 116);

    function addGrass(originGrass, x, y, z) {
      var grass = originGrass.clone();
      grass.position.set(x, y, z);
      that.scene.add(grass);
    }

    function addGrassGround(origin, x, y, z) {
      var ground = origin.clone();
      ground.position.set(x, 0.5, z);
      that.scene.add(ground);
    }
  };
}

Scenario.prototype.updateScene = function (json) {
  const that = this;

  if (this.AREA_TRAIN) {
    console.log('clear scene');
    // window.cancelAnimationFrame(this.requestID);
    this.scene.remove(this.AREA_TRAIN);
    this.scene.traverse(function (e) {
      if (e.name === 'tree' || e.name === 'text' || e.name === 'obstacle' || e.name === 'grass') {
        // || e instanceof THREE.Mesh && e !== plane
        that.REMOVE_OBJECTS.push(e); //fix
      }
    });
    for (let i = 0; i < this.REMOVE_OBJECTS.length; i++) {
      this.scene.remove(this.REMOVE_OBJECTS[i]);
    }
    this.REMOVE_OBJECTS.splice(0, this.REMOVE_OBJECTS.length);
    // this.AREA_TRAIN.geometry.dispose();//fix：Possible Unhandled Promise Rejection: TypeError: Cannot read property 'dispose' of undefined
    // this.AREA_TRAIN.material.dispose();
    this.AREA_TRAIN = null;
    this.AREA_TRAIN = new DriverSchool().createTrainArea(json);
    this.scene.add(this.AREA_TRAIN);
  } else {
    console.log('createTrainArea');
    this.AREA_TRAIN = new DriverSchool().createTrainArea(json);
    // this.AREA_TRAIN.rotation.y = Math.PI * 0.5;//食堂 调整角度
    this.scene.add(this.AREA_TRAIN);
  }

  function DriverSchool() {
    var outW = Constants.TRAINLAND_MARGIN; //场地向外拓展距离
    var outWofBase = outW + 1000;

    this.createTrainArea = function (json) {
      var object3d = new THREE.Object3D();

      var forbidLine = this.createForbidLine(json);
      object3d.add(forbidLine);

      // var trainRoad = this.createTrainRoad(json)
      // object3d.add(trainRoad)
      this.createTrainRoad(json);

      // var kerb = this.createKerb(json)
      // object3d.add(kerb)
      var ground = this.createGround(json);
      object3d.add(ground);

      // var brickRoad = this.createBrickRoad(json);
      // object3d.add(brickRoad);
      var wall = this.createWall2(json);
      object3d.add(wall);

      this.creatTrees(json);

      this.createRoadSign(json);

      var hasObstacle = false;

      var obstacle = this.createObstacle(json);
      object3d.add(obstacle);

      // that.createGrass(json);
      // var flowerBed = this.createFlowerBed(json);
      // object3d.add(flowerBed);
      var flowerFence = this.createFlowerFence(json);
      object3d.add(flowerFence);

      return object3d;
    };

    this.createForbidLine = function (jo) {
      var object3d = new THREE.Object3D();
      var solidLineGeometry = new THREE.Geometry();
      var errorLineGeometry = new THREE.Geometry();
      // var cloudLineGeometry = new THREE.Geometry();
      // var dottedLineGeometry = new THREE.Geometry();
      for (let i = 0; i < jo.itemDatas.length; i++) {
        function drawItem(itemData) {
          for (let i = 0; i < itemData.drawLines.length; i++) {
            function drawItemLine(lineData) {
              //实线处理
              var geometry = new THREE.Geometry();
              if (itemData.itemID === '20300') {
                //fieldCode 6,7 直角转弯20700  8上坡20300
                // console.log(lineData.index +','+ lineData.startZ +','+ lineData.endZ)
                // if (lineData.index === -1) lineData.endZ = lineData.startZ = 7500;
                geometry.vertices.push(
                  new THREE.Vector3(
                    lineData.startX / 100.0,
                    lineData.startZ / 100.0 - Constants.BASE_H2,
                    -lineData.startY / 100.0,
                  ),
                );
                geometry.vertices.push(
                  new THREE.Vector3(
                    lineData.endX / 100.0,
                    lineData.endZ / 100.0 - Constants.BASE_H2,
                    -lineData.endY / 100.0,
                  ),
                );
              } else {
                geometry.vertices.push(
                  new THREE.Vector3(lineData.startX / 100.0, Constants.FORBIDLINE_HEIGHT, -lineData.startY / 100.0),
                );
                geometry.vertices.push(
                  new THREE.Vector3(lineData.endX / 100.0, Constants.FORBIDLINE_HEIGHT, -lineData.endY / 100.0),
                );
              }
              var line = new THREE.Line(geometry, undefined);
              line.updateMatrix();
              //虚线处理
              let points = [];
              points.push(lineData.startX / 100.0, Constants.FORBIDLINE_HEIGHT, -lineData.startY / 100.0);
              points.push(lineData.endX / 100.0, Constants.FORBIDLINE_HEIGHT, -lineData.endY / 100.0);

              if (lineData.type === 0) {
                //实线
                // solidLineGeometry.merge(line.geometry, line.matrix)
                that.drawStaticLines(geometry.vertices, Constants.FORBIDLINE_SOLID_MATERAIL, 0, 0, 0, '0xffffff');
              } else if (lineData.type === 1) {
                //错误线
                errorLineGeometry.merge(line.geometry, line.matrix);
              } else if (lineData.type === 2) {
                //云线
                // cloudLineGeometry.merge(line.geometry, line.matrix)

                // line = new THREE.Line(geometry, Constants.FORBIDLINE_CLOUD_MATERAIL);
                // line.computeLineDistances();//不可或缺的，若无，则线段不能显示为虚线
                // object3d.add(line)

                that.drawStaticDashLines(
                  itemData.itemID,
                  geometry.vertices,
                  Constants.FORBIDLINE_CLOUD_MATERAIL,
                  2,
                  that.dashSize,
                  that.gapSize,
                );
              } else if (lineData.type === 3) {
                //虚线
                // dottedLineGeometry.merge(line.geometry, line.matrix)

                // line = new THREE.Line(geometry, Constants.FORBIDLINE_DOTTED_MATERAIL);
                // line.computeLineDistances();//不可或缺的，若无，则线段不能显示为虚线
                // object3d.add(line)

                that.drawStaticDashLines(
                  itemData.itemID,
                  geometry.vertices,
                  Constants.FORBIDLINE_DOTTED_MATERAIL,
                  2,
                  that.dashSize,
                  that.gapSize,
                );
              }
            }

            drawItemLine(itemData.drawLines[i]);
          }
        }

        drawItem(jo.itemDatas[i]);
      }

      var solidLine = new THREE.LineSegments(solidLineGeometry, Constants.FORBIDLINE_SOLID_MATERAIL);
      object3d.add(solidLine);

      var errorLine = new THREE.LineSegments(errorLineGeometry, Constants.FORBIDLINE_ERROR_MATERAIL);
      object3d.add(errorLine);

      // var cloudLine = new THREE.LineSegments(cloudLineGeometry, Constants.FORBIDLINE_CLOUD_MATERAIL)
      // object3d.add(cloudLine)

      // var dottedLine = new THREE.LineSegments(dottedLineGeometry, Constants.FORBIDLINE_DOTTED_MATERAIL)
      // object3d.add(dottedLine)

      return object3d;
    };

    this.createBrickRoad = function (jsObject) {
      let list = []; // 用来装点位的数组
      var mnX = jsObject.startX / 100.0 - outW;
      var mxX = jsObject.endX / 100.0 + outW;
      var mxY = jsObject.startY / 100.0 - outW;
      var mnY = jsObject.endY / 100.0 + outW;
      list.push(new THREE.Vector2(mnX, mnY));
      list.push(new THREE.Vector2(mxX, mnY));
      list.push(new THREE.Vector2(mxX, mxY));
      list.push(new THREE.Vector2(mnX, mxY));

      that.POLYGON_POINTS_AREA[0] = [mnX, mnY];
      that.POLYGON_POINTS_AREA[1] = [mxX, mnY];
      that.POLYGON_POINTS_AREA[2] = [mxX, mxY];
      that.POLYGON_POINTS_AREA[3] = [mnX, mxY];
      // 用这些点位生成一个 Geometry
      // let brickRoadGeometry = new THREE.ShapeGeometry(new THREE.Shape(list));

      // 刚体

      var sx = mxX - mnX + 1000;
      var sy = 10; //fix 不能为负 太小会导致穿模 .1
      var sz = mxY - mnY + 1000;
      that.pos.set((mxX + mnX) * 0.5, -sy / 2.0, (mxY + mnY) * 0.5);
      that.quat.set(0, 0, 0, 1); //同时修改图像和物理
      that.brickRoadMesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), that.BRICK_STONE_MATERIAL_DAY);
      that.brickRoadMesh.name = 'brickRoad';
      that.brickRoadMesh.castShadow = true;
      that.brickRoadMesh.receiveShadow = true;

      const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
      shape.setMargin(Constants.margin);
      that.createRigidBody(that.brickRoadMesh, shape, 0, that.pos, that.quat, 'brickRoad');

      //地平面

      let list2 = []; // 用来装点位的数组
      mnX = jsObject.startX / 100.0 - outWofBase;
      mxX = jsObject.endX / 100.0 + outWofBase;
      mnY = jsObject.startY / 100.0 - outWofBase;
      mxY = jsObject.endY / 100.0 + outWofBase;
      list2.push(new THREE.Vector2(mnX, mnY));
      list2.push(new THREE.Vector2(mxX, mnY));
      list2.push(new THREE.Vector2(mxX, mxY));
      list2.push(new THREE.Vector2(mnX, mxY));
      let baseGroundGeometry = new THREE.ShapeGeometry(new THREE.Shape(list2));
      var baseGroundMesh = new THREE.Mesh(baseGroundGeometry, that.BASE_GROUND_MATERIAL);
      baseGroundMesh.name = 'base_ground';
      baseGroundMesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
      // baseGroundMesh.position.y = -0.5;
      baseGroundMesh.position.set((mxX + mnX) * 0.5, -0.5, (mxY + mnY) * 0.5);
      that.scene.add(baseGroundMesh);
      return that.brickRoadMesh;
    };

    this.createGround = function (jo) {
      var mnX = 0; //jo.startX / 100.0
      var mxX = 0; //jo.endX / 100.0
      var mnY = 0; //jo.startY / 100.0
      var mxY = 0; //jo.endY / 100.0
      let list = [];
      if (jo.wallDatas) {
        for (let i = 0; i < jo.wallDatas.length; i++) {
          let x = jo.wallDatas[i].x / 100.0;
          let y = jo.wallDatas[i].y / 100.0;
          list.push(new THREE.Vector2(x, y));
          if (x < mnX) {
            mnX = x;
          } else if (x > mxX) {
            mxX = x;
          }
          if (y < mnY) {
            mnY = y;
          } else if (y > mxY) {
            mxY = y;
          }
        }
      }
      var centerX = (mxX + mnX) * 0.5;
      var centerY = (mxY + mnY) * 0.5;

      var sx = mxX - mnX;
      var sy = 10; //fix 不能为负 太小会导致穿模 .1
      var sz = mxY - mnY;
      that.pos.set(centerX, -sy / 2.0, centerY);
      that.quat.set(0, 0, 0, 1); //同时修改图像和物理

      //普通地面
      // that.graphGroundMesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), that.BRICK_STONE_MATERIAL_DAY);
      // that.graphGroundMesh.name = 'brick_ground'
      // that.graphGroundMesh.castShadow = true;
      // that.graphGroundMesh.receiveShadow = true;
      // that.scene.add(that.graphGroundMesh)
      // that.graphGroundMesh.position.set(centerX, -sy / 2.0, centerY)

      console.log('地面', list);

      //普通地面2
      that.graphGroundMesh = new THREE.Mesh(
        new THREE.ShapeGeometry(new THREE.Shape(list)),
        that.BRICK_STONE_MATERIAL_DAY,
      );
      that.graphGroundMesh.name = 'brick_ground';
      that.graphGroundMesh.castShadow = true;
      that.graphGroundMesh.receiveShadow = true;
      that.graphGroundMesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
      that.scene.add(that.graphGroundMesh);

      if (true) {
        //刚体地面
        that.rigidGroundMesh = new THREE.Mesh(
          new THREE.BoxGeometry(sx + 1000, sy, sz + 1000, 1, 1, 1),
          new THREE.MeshBasicMaterial({ color: 0x3485fb, transparent: true, opacity: 0.0 }),
        );
        that.rigidGroundMesh.name = 'brick_ground';

        const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
        shape.setMargin(Constants.margin);
        that.createRigidBody(that.rigidGroundMesh, shape, 0, that.pos, that.quat, 'brick_ground');
      }

      // 草坪地面;
      // let list2 = []; // 用来装点位的数组
      // var outW = 1000;
      // mnX = jo.startX / 100.0 - outW;
      // mxX = jo.endX / 100.0 + outW;
      // mnY = jo.startY / 100.0 - outW;
      // mxY = jo.endY / 100.0 + outW;
      // list2.push(new THREE.Vector2(mnX, mnY));
      // list2.push(new THREE.Vector2(mxX, mnY));
      // list2.push(new THREE.Vector2(mxX, mxY));
      // list2.push(new THREE.Vector2(mnX, mxY));
      // let baseGroundGeometry = new THREE.ShapeGeometry(new THREE.Shape(list2));
      // var grassGroundMesh = new THREE.Mesh(baseGroundGeometry, that.GRASS_GROUND_MATERIAL);
      // grassGroundMesh.name = 'base_ground';
      // grassGroundMesh.castShadow = true;
      // grassGroundMesh.receiveShadow = true;
      // grassGroundMesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
      // grassGroundMesh.position.set(centerX, -0.5, centerY);
      // that.scene.add(grassGroundMesh);

      //草坪地面2
      let points = []; // 用来装点位的数组
      let ratio = 2.6; //草坪扩展比例 fix 与天空球半径联动
      var array = [
        [mnX, mnY],
        [mxX, mnY],
        [mxX, mxY],
        [mnX, mxY],
      ];
      for (let i = 0; i < array.length; i++) {
        let xoff = (array[i][0] - centerX) * ratio;
        let yoff = (array[i][1] - centerY) * ratio;
        points.push(new THREE.Vector2(centerX + xoff, centerY + yoff));
      }
      console.log(points);
      let baseGroundGeometry = new THREE.ShapeGeometry(new THREE.Shape(points));
      var grassGroundMesh = new THREE.Mesh(baseGroundGeometry, that.BASE_GROUND_MATERIAL);
      grassGroundMesh.name = 'base_ground';
      grassGroundMesh.castShadow = true;
      grassGroundMesh.receiveShadow = true;
      grassGroundMesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
      grassGroundMesh.position.y = -0.5;
      that.scene.add(grassGroundMesh);

      //草坪地面3
      // var grassGroundMesh = new THREE.Mesh(new THREE.BoxGeometry(sx + 0, sy, sz + 0, 1, 1, 1), that.GRASS_GROUND_MATERIAL);
      // grassGroundMesh.name = 'base_ground'
      // grassGroundMesh.castShadow = true;
      // grassGroundMesh.receiveShadow = true;
      // that.scene.add(grassGroundMesh)
      // grassGroundMesh.position.set(centerX, -sy / 2.0 -1, centerY)

      // if (Constants.USE_CANNON) {
      //   // let phys = new TrimeshCollider(grassGroundMesh, {});
      //   // that.world.physicsWorld.addBody(phys.body);
      //   let phys = new BoxCollider({ size: new THREE.Vector3(1000, 1000, 0.1) });
      //   let newPos = new THREE.Vector3().copy(grassGroundMesh.position);
      //   newPos.y = 0.1;
      //   phys.body.position.copy(Utils.cannonVector(newPos));
      //   phys.body.quaternion.copy(Utils.cannonQuat(grassGroundMesh.quaternion));
      //   phys.body.computeAABB();
      //   phys.body.shapes.forEach((shape) => {
      //     shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
      //   });
      //   that.world.physicsWorld.addBody(phys.body);
      // }
      return that.rigidGroundMesh;
    };

    this.createTrainRoad = function (jsObject) {
      let trainRoadGeometry = new THREE.Geometry();
      for (let i = 0; i < jsObject.itemDatas.length; i++) {
        function drawItem(itemData) {
          // let list = [];// 用来装点位的数组
          if (itemData.itemID === '20300') {
            // 初始化几何形状
            var geometry = new THREE.Geometry();
            // 设置顶点位置
            if (itemData.pointList.length === 0) return;
            for (let i = 0; i < itemData.pointList.length; i++) {
              geometry.vertices.push(
                new THREE.Vector3(
                  itemData.pointList[i].point.x / 100.0,
                  itemData.pointList[i].point.y / 100.0,
                  itemData.pointList[i].point.z / 100.0 - Constants.BASE_H2,
                ),
              );
            }
            var tmpx = (itemData.pointList[4].point.x + itemData.pointList[5].point.x) / 2.0;
            creatStopSign(
              new THREE.Vector3(
                tmpx / 100.0,
                itemData.pointList[5].point.z / 100.0 - Constants.BASE_H2 + 5,
                -itemData.pointList[5].point.y / 100.0,
              ),
            );

            // 设置顶点连接情况
            geometry.faces.push(new THREE.Face3(0, 8, 7));
            geometry.faces.push(new THREE.Face3(7, 11, 0));

            let mesh = new THREE.Mesh(geometry, Constants.TRAINROAD_MATERIAL);
            mesh.name = 'obstacle';
            mesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
            that.scene.add(mesh);
          }
          if (itemData.point) {
            //添加文字
            var textInMesh = that.createTextInMesh(' ' + itemData.fieldCode.toString() + ' ', {
              fontsize: 100, //20
              borderColor: { r: 255, g: 255, b: 255, a: 1 } /* 边框透明 */,
              backgroundColor: {
                r: 255,
                g: 255,
                b: 255,
                a: 0,
              } /* 背景颜色透明 */,
              fillStyle: { r: 255, g: 255, b: 255, a: 1.0 } /* 字体颜色 */,
            });
            textInMesh.name = 'text';
            textInMesh.scale.set(2.3, 2.3, 0); //3, 3, 0
            textInMesh.position.x = itemData.point.x / 100.0 + 8;
            if (itemData.itemID === '20300') {
              textInMesh.position.y = 6;
              textInMesh.rotation.y = (6 * Math.PI) / 180;
            } else {
              textInMesh.position.y = 0.6;
            }
            textInMesh.position.z = -itemData.point.y / 100.0;
            textInMesh.rotation.x = -Math.PI / 2;
            that.scene.add(textInMesh);
          }
        }

        drawItem(jsObject.itemDatas[i]);

        //停止标志
        function creatStopSign(pos) {
          const loader = new OBJLoader();
          new MTLLoader().load('signs/StopSign.mtl', function (materials) {
            loader.setMaterials(materials);
            loader.load('signs/StopSign.obj', function (object) {
              object.scale.set(3, 3, 3);
              object.position.set(pos.x, pos.y, pos.z);
              object.name = 'obstacle';
              that.scene.add(object);
            });
          });
        }
      }

      // 恢复高度 如果你需要 可以改成原本高度,也可以你随意的
      for (let i = 0; i < trainRoadGeometry.vertices.length; i++) {
        trainRoadGeometry.vertices[i].z = 0.3;
      }
      let mesh = new THREE.Mesh(trainRoadGeometry, Constants.TRAINROAD_MATERIAL);
      mesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
      return mesh;
    };

    this.createFlowerBed = function (jsObject) {
      console.log('生成花', jsObject.grassPoints);
      if (jsObject.grassPoints.length === 0) {
        return;
      }

      let flowerBedGeometry = new THREE.Geometry();
      for (let i = 0; i < jsObject.grassPoints.length; i++) {
        function drawItem(points) {
          let list = []; // 用来装点位的数组
          if (points.length === 0) return;
          for (let i = 0; i < points.length; i++) {
            list.push(new THREE.Vector2(points[i].x / 100.0, points[i].y / 100.0));
          }
          // 用这些点位生成一个 Geometry
          let shapeGeometry = new THREE.ShapeGeometry(new THREE.Shape(list));
          let mesh = new THREE.Mesh(shapeGeometry, undefined);
          flowerBedGeometry.merge(mesh.geometry, mesh.matrix);
        }

        drawItem(jsObject.grassPoints[i]);
      }

      // 恢复高度 如果你需要 可以改成原本高度,也可以你随意的
      for (let i = 0; i < flowerBedGeometry.vertices.length; i++) {
        flowerBedGeometry.vertices[i].z = 1.1;
      }

      this.createFastGrassInGeometry(flowerBedGeometry);

      let mesh = new THREE.Mesh(flowerBedGeometry, that.GRASS_LIGHT_MATERIAL);
      mesh.lookAt(new THREE.Vector3(0, 1, 0)); //调正位面
      return mesh;
    };

    this.createFastGrassInGeometry = function (geometry) {
      var object3d = new THREE.Object3D();
      object3d.name = 'obstacle';
      var num = 200;
      object3d.add(that.fastGrasses2(randomPointsInGeometry(geometry, num), 'grass/flowers01.png'));
      object3d.add(that.fastGrasses2(randomPointsInGeometry(geometry, num), 'grass/flowers02.png'));
      object3d.add(that.fastGrasses2(randomPointsInGeometry(geometry, num / 2), 'grass/grass01.png'));
      object3d.add(that.fastGrasses2(randomPointsInGeometry(geometry, num / 2), 'grass/grass02.png'));
      that.scene.add(object3d);
      return object3d;
    };

    this.createFlowerFence = function (jsObject) {
      var object3d = new THREE.Object3D();
      var kerbGeometry = new THREE.BoxGeometry(1, 1, 1);
      kerbGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
      // var kerbMesh = new THREE.Mesh(kerbGeometry)
      // var kerbsGeometry = new THREE.Geometry();
      for (let i = 0; i < jsObject.grassPoints.length; i++) {
        function drawItem(points) {
          for (let i = 0; i < points.length - 1; i++) {
            var item = that.createCylinderByTwoPoints2(
              new THREE.Vector3(points[i].x / 100.0, Constants.FLOWER_FENCE_H, -points[i].y / 100.0),
              new THREE.Vector3(points[i + 1].x / 100.0, Constants.FLOWER_FENCE_H, -points[i + 1].y / 100.0),
            );
            object3d.add(item);
          }
          item = that.createCylinderByTwoPoints2(
            new THREE.Vector3(
              points[points.length - 1].x / 100.0,
              Constants.FLOWER_FENCE_H,
              -points[points.length - 1].y / 100.0,
            ),
            new THREE.Vector3(points[0].x / 100.0, Constants.FLOWER_FENCE_H, -points[0].y / 100.0),
          );
          object3d.add(item);
        }

        drawItem(jsObject.grassPoints[i]);
      }
      return object3d;
    };

    this.createKerb = function (jsObject) {
      var object3d = new THREE.Object3D();
      var kerbGeometry = new THREE.BoxGeometry(1, 1, 1);
      kerbGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
      // var kerbMesh = new THREE.Mesh(kerbGeometry)
      // var kerbsGeometry = new THREE.Geometry();
      for (let i = 0; i < jsObject.itemDatas.length; i++) {
        function drawItem(itemData) {
          for (let i = 0; i < itemData.drawLines.length; i++) {
            function drawItemKerb(lineData) {
              //绘制路肩
              if (lineData.type === 0) {
                //实线
                var item = that.createCylinderByTwoPoints2(
                  new THREE.Vector3(lineData.startX / 100.0, -0.3, -lineData.startY / 100.0),
                  new THREE.Vector3(lineData.endX / 100.0, -0.3, -lineData.endY / 100.0),
                );
                object3d.add(item);
              }
            }

            if (itemData.itemID !== '20300') {
              //倒车入库20100 直角转弯20700 上坡20300
              drawItemKerb(itemData.drawLines[i]);
            }
          }
        }

        drawItem(jsObject.itemDatas[i]);
      }
      return object3d;
    };

    this.createWall = function (jsObject) {
      var mnX = jsObject.startX / 100.0 - outW;
      var mxX = jsObject.endX / 100.0 + outW;
      var mnY = jsObject.startY / 100.0 - outW;
      var mxY = jsObject.endY / 100.0 + outW;

      var object3d = new THREE.Object3D();

      console.log(mnX + ',' + mnY + ',' + mxX + ',' + mxY);
      object3d.add(createBrickIronWall(mnX, mnY, mxX, mxY, 160)); //fix
      object3d.add(createGate()); //fix

      return object3d;

      function createGate() {
        var object3d = new THREE.Object3D();
        new FBXLoader().load('wall/dianongmen.fbx', function (object) {
          object.scale.set(0.2, 0.1, 0.1); //.08, .08, .08
          object.name = 'obstacle';
          object.rotation.y = (180.0 * Math.PI) / 180.0;
          object.position.x = mxX - 160 - 30;
          object.position.z = mxY - 9;
          object3d.add(object);

          var gate = object.clone();
          gate.position.x = mxX - 160 - 30;
          gate.position.z = mnY + 5;
          object3d.add(gate);
        });
        return object3d;
      }

      function createBrickIronWall(mnX, mnY, mxX, mxY, gateOffset) {
        //fix
        var object3d = new THREE.Object3D();
        const offset = 50.5;
        // 砖石栏杆墙
        new FBXLoader().load('wall/wall.fbx', function (object) {
          object.scale.set(5, 5, 5);
          object.name = 'obstacle';
          for (let x = mnX; x < mxX - gateOffset; x += offset) {
            addWall(object, x, 0, mnY);
          }
          for (let x = mnX; x < mxX - gateOffset; x += offset) {
            addWall(object, x, 0, mxY);
          }

          var wallNS = object.clone();
          wallNS.rotation.y = Math.PI / 2.0;

          for (let y = mnY; y < mxY; y += offset) {
            addWall(wallNS, mnX, 0, y);
          }
          for (let y = mnY; y < mxY; y += offset) {
            addWall(wallNS, mxX, 0, y);
          }

          function addWall(origin, posX, posY, posZ) {
            var wall = origin.clone();
            wall.position.set(posX, posY, posZ);
            object3d.add(wall);
          }
        });
        return object3d;
      }
    };

    this.createWall2 = function (json) {
      // console.log(json.wallDatas)
      if (!json.wallDatas) return;
      console.log('生成墙');
      var object3d = new THREE.Object3D();
      object3d.add(createBrickIronWall(json.wallDatas));
      return object3d;

      function createBrickIronWall(data) {
        var object3d = new THREE.Object3D();
        const offset = 80.0;
        const threshold = 10;

        // 砖石栏杆墙

        new FBXLoader().load('wall/wall.fbx', function (object) {
          object.scale.set(8, 5, 5);
          object.name = 'obstacle';

          for (let i = 1; i < data.length; i++) {
            //data.length
            // that.world.mMeasure.testFloorLine(new THREE.Vector3(data[i - 1].x / 100.0, 50, -data[i - 1].y / 100.0), FORBIDLINE_ERROR_MATERAIL);
            let sx = Math.min(data[i - 1].x / 100.0, data[i].x / 100.0),
              sy = Math.min(-data[i - 1].y / 100.0, -data[i].y / 100.0),
              sz = data[i - 1].z / 100.0;

            let ex = Math.max(data[i - 1].x / 100.0, data[i].x / 100.0),
              ey = Math.max(-data[i - 1].y / 100.0, -data[i].y / 100.0),
              ez = data[i].z / 100.0;

            if (ex - sx > ey - sy) {
              //东西向
              let num = Math.ceil((ex - sx) / offset);
              let offs = (ex - sx) / num;
              // console.log(num, offs)
              if (offs > threshold) {
                for (let x = sx + offs / 2.0; x < ex; x += offs) {
                  addWall(object, x, 0, sy, offs / offset, 1);
                }
              }
            } else {
              //南北向
              var wallNS = object.clone();
              wallNS.rotation.y = Math.PI / 2.0;
              let num = Math.ceil((ey - sy) / offset);
              let offs = (ey - sy) / num;
              // console.log(num, offs)
              if (offs > threshold) {
                for (let y = sy + offs / 2.0; y < ey; y += offs) {
                  addWall(wallNS, sx, 0, y, offs / offset, 1);
                }
              }
            }
          }

          let sx = Math.min(data[data.length - 1].x / 100.0, data[0].x / 100.0),
            sy = Math.min(-data[data.length - 1].y / 100.0, -data[0].y / 100.0),
            sz = data[data.length - 1].z / 100.0;

          let ex = Math.max(data[data.length - 1].x / 100.0, data[0].x / 100.0),
            ey = Math.max(-data[data.length - 1].y / 100.0, -data[0].y / 100.0),
            ez = data[0].z / 100.0;

          if (ex - sx > ey - sy) {
            //东西向
            let num = Math.ceil((ex - sx) / offset);
            let offs = (ex - sx) / num;
            // console.log(num, offs)
            if (offs > threshold) {
              for (let x = sx + offs / 2.0; x < ex; x += offs) {
                addWall(object, x, 0, sy, offs / offset, 1);
              }
            }
          } else {
            //南北向
            // eslint-disable-next-line no-redeclare
            var wallNS = object.clone();
            wallNS.rotation.y = Math.PI / 2.0;
            let num = Math.ceil((ey - sy) / offset);
            let offs = (ey - sy) / num;
            // console.log(num, offs)

            if (offs > threshold) {
              for (let y = sy + offs / 2.0; y < ey; y += offs) {
                addWall(wallNS, sx, 0, y, offs / offset, 1);
              }
            }
          }

          function addWall(origin, posX, posY, posZ, scaleX, scaleZ) {
            var wall = origin.clone();

            wall.position.set(posX, posY, posZ);

            wall.scale.set(scaleX * 8, 5, scaleZ * 5);

            object3d.add(wall);
          }
        });
        return object3d;
      }
    };

    this.createObstacle = function (json) {
      var object3d = new THREE.Object3D();
      object3d.name = 'obstacle';

      for (let i = 0; i < json.itemDatas.length; i++) {
        if (json.itemDatas[i].itemID === '20300') {
          // 绘制矮墙和检测区域
          addRamp(json.rampWall);
        }
      }
      if (json.schoolName) {
        console.log(json.schoolName);
        if (json.schoolName === '杭邮驾校') {
          addRampBody1();
        } else if (json.schoolName === '同力驾校') {
          addRampBody2();
        } else if (json.schoolName === '同力驾校新场地') {
          addRampBody3();
        }
      } else {
        addRampBody1();
      }
      return object3d;

      function addRamp(itemData) {
        // // 绘制矮墙
        console.log(itemData, '绘制矮墙');
        for (let i = 0; i < itemData.length; i++) {
          for (let j = 0; j < itemData[i].length - 1; j++) {
            if (j === 3) continue;
            drawBarrier(itemData[i][j], itemData[i][j + 1]);
          }
        }

        // 检测区域为一个坡道 矩形 坡道边缘线向外延长
        var offsetX = 0;
        var offsetZ = 0; //13
        that.POLYGON_RAMP_POINTS[0] = [itemData[0][0].x / 100.0 + offsetX, -itemData[0][0].y / 100.0 - offsetZ];
        that.POLYGON_RAMP_POINTS[1] = [itemData[0][3].x / 100.0 - offsetX, -itemData[0][3].y / 100.0 - offsetZ];
        that.POLYGON_RAMP_POINTS[2] = [itemData[0][4].x / 100.0 - offsetX, -itemData[0][4].y / 100.0 + offsetZ];
        that.POLYGON_RAMP_POINTS[3] = [itemData[0][7].x / 100.0 + offsetX, -itemData[0][7].y / 100.0 + offsetZ];

        that.drawSLinesFromArr(
          that.POLYGON_RAMP_POINTS,
          'obstacle',
          new THREE.LineDashedMaterial({
            side: THREE.DoubleSide,
            // lineWidth: 20,//无效
            color: 0xffffff, //线段的颜色
            dashSize: 1, //短划线的大小
            // gapSize: 3,//短划线之间的距离
            transparent: true,
            scale: 1.0, // 比例越大，虚线越密；反之，虚线越疏
          }),
        );
        // FIXME 绘制坡道检测区域,发版隐藏掉
        // that.drawSLinesFromArr(
        //   that.teachAreaManager.getRampRange(itemData.fieldCode),
        //   'obstacle',
        //   new THREE.LineDashedMaterial({
        //     side: THREE.DoubleSide,
        //     // lineWidth: 20,//无效
        //     color: 0xffffff, //线段的颜色
        //     dashSize: 1, //短划线的大小
        //     // gapSize: 3,//短划线之间的距离
        //     scale: 1.0, // 比例越大，虚线越密；反之，虚线越疏
        //     transparent: true,
        //     opacity: 0.1,
        //   }),
        // );
      }

      //杭邮坡道
      function addRampBody1() {
        //绘制坡道
        var ramp = new THREE.Group();
        var obstacleX = 59;
        var obstacleZ = 273.9;
        var obstacleW = 72;
        //上坡
        that.pos.set(104 + obstacleX, -2.0, obstacleZ + 4.1);
        that.quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (-4.4 * Math.PI) / 180); // 根据相对坐标计算角度
        that.obstacleUp = createParalellepiped(
          158,
          15,
          obstacleW,
          0,
          that.pos,
          combineRotation(that.quat),
          that.BRICK_STONE_MATERIAL_DAY2,
        );
        that.obstacleUp.castShadow = true;
        that.obstacleUp.receiveShadow = true;
        ramp.add(that.obstacleUp);
        //坡顶
        that.pos.set(obstacleX, 4.03, obstacleZ);
        that.quat.setFromAxisAngle(new THREE.Vector3(0, 0, 0), (4.7 * Math.PI) / 180);
        that.obstacleTop = createParalellepiped(
          52,
          15,
          obstacleW,
          0,
          that.pos,
          combineRotation(that.quat),
          that.BRICK_STONE_MATERIAL_DAY2,
        );
        that.obstacleTop.castShadow = true;
        that.obstacleTop.receiveShadow = true;
        ramp.add(that.obstacleTop);
        //下坡
        that.pos.set(-91 + obstacleX, -1.4, obstacleZ - 3.5);
        that.quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (4.7 * Math.PI) / 180);
        that.obstacleDown = createParalellepiped(
          131.8,
          15,
          obstacleW,
          0,
          that.pos,
          combineRotation(that.quat),
          that.BRICK_STONE_MATERIAL_DAY2,
        );
        that.obstacleDown.castShadow = true;
        that.obstacleDown.receiveShadow = true;
        ramp.add(that.obstacleDown);
        object3d.add(ramp);
        // if (Constants.USE_CANNON) {
        //   let phys = new TrimeshCollider(that.obstacleUp, {});
        //   that.world.physicsWorld.addBody(phys.body); //将刚体添加到物理世界中

        //   let phys2 = new TrimeshCollider(that.obstacleTop, {});
        //   that.world.physicsWorld.addBody(phys2.body); //将刚体添加到物理世界中

        //   let phys3 = new TrimeshCollider(that.obstacleDown, {});
        //   that.world.physicsWorld.addBody(phys3.body); //将刚体添加到物理世界中
        // }
      }

      //同力坡道
      function addRampBody2() {
        //绘制坡道
        var ramp = new THREE.Group();
        var obstacleX = -37;
        var obstacleZ = -3;
        var obstacleW = 56;
        //上坡
        that.pos.set(obstacleX + 4.1, -2.0, obstacleZ + 53);
        that.quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (-6.2 * Math.PI) / 180); // 根据相对坐标计算角度
        that.obstacleUp = createParalellepiped(
          obstacleW,
          15,
          137,
          0,
          that.pos,
          combineRotation(that.quat),
          that.BRICK_STONE_MATERIAL_DAY2,
        );
        that.obstacleUp.castShadow = true;
        that.obstacleUp.receiveShadow = true;
        ramp.add(that.obstacleUp);
        //坡顶
        that.pos.set(obstacleX + 1, 5.29, obstacleZ + 129);
        that.quat.setFromAxisAngle(new THREE.Vector3(0, 0, 0), (4.7 * Math.PI) / 180);
        that.obstacleTop = createParalellepiped(
          obstacleW,
          15,
          22,
          0,
          that.pos,
          combineRotation(that.quat),
          that.BRICK_STONE_MATERIAL_DAY2,
        );
        that.obstacleTop.castShadow = true;
        that.obstacleTop.receiveShadow = true;
        ramp.add(that.obstacleTop);
        //下坡
        that.pos.set(obstacleX - 1.5, -1.4, obstacleZ + 198);
        that.quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (6.4 * Math.PI) / 180);
        that.obstacleDown = createParalellepiped(
          obstacleW,
          15,
          121.1,
          0,
          that.pos,
          combineRotation(that.quat),
          that.BRICK_STONE_MATERIAL_DAY2,
        );
        that.obstacleDown.castShadow = true;
        that.obstacleDown.receiveShadow = true;
        ramp.add(that.obstacleDown);
        object3d.add(ramp);
        // if (Constants.USE_CANNON) {
        //   let phys = new TrimeshCollider(that.obstacleUp, {});
        //   that.world.physicsWorld.addBody(phys.body); //将刚体添加到物理世界中

        //   let phys2 = new TrimeshCollider(that.obstacleTop, {});
        //   that.world.physicsWorld.addBody(phys2.body); //将刚体添加到物理世界中

        //   let phys3 = new TrimeshCollider(that.obstacleDown, {});
        //   that.world.physicsWorld.addBody(phys3.body); //将刚体添加到物理世界中
        // }
      }
      //同力驾校新场地坡道
      function addRampBody3(rampPoints) {
        //绘制坡道
        var ramp = new THREE.Group();
        var rampW = 35; //坡道宽度
        var rampH = 14; //坡道厚度
        var offX = -178;
        var degreeY = 1.9;

        var rampUpDegree = 4.3; //上坡角度
        var rampTopDegree = 4.7; //坡顶角度
        var rampDownDegree = -6.2; //下坡角度

        var rampUpL = 230; //上坡长度
        var rampTopL = 20; //坡顶长度
        var rampDownL = 200; //下坡长度 107

        var rampUpY = 158; //上坡y坐标
        var rampTopY = rampUpY - (rampUpL + rampTopL) / 2.0; //坡顶y坐标
        var rampDownY = rampTopY - (rampDownL + rampTopL) / 2.0; //下坡y坐标

        //上坡
        that.pos.set(offX, -3.4, rampUpY); // -rampH / Math.cos(rampUpDegree * Math.PI / 180) / 2.0
        that.quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (rampUpDegree * Math.PI) / 180);
        that.obstacleDown = createParalellepiped(
          rampW,
          rampH,
          rampUpL,
          0,
          that.pos,
          combineRotation(that.quat, degreeY),
          that.BRICK_STONE_MATERIAL_DAY2,
        );
        that.obstacleDown.castShadow = true;
        that.obstacleDown.receiveShadow = true;
        ramp.add(that.obstacleDown);
        //坡顶
        that.pos.set(offX - 4.3, 5.29, rampTopY);
        that.quat.setFromAxisAngle(new THREE.Vector3(0, 0, 0), (rampTopDegree * Math.PI) / 180);
        that.obstacleTop = createParalellepiped(
          rampW,
          rampH,
          rampTopL + 4,
          0,
          that.pos,
          combineRotation(that.quat, degreeY),
          that.BRICK_STONE_MATERIAL_DAY2,
        );
        that.obstacleTop.castShadow = true;
        that.obstacleTop.receiveShadow = true;
        ramp.add(that.obstacleTop);
        //下坡
        that.pos.set(offX - 7.9, -5.5, rampDownY);
        that.quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (rampDownDegree * Math.PI) / 180); // 根据相对坐标计算角度
        that.obstacleUp = createParalellepiped(
          rampW,
          rampH,
          rampDownL,
          0,
          that.pos,
          combineRotation(that.quat, degreeY),
          that.BRICK_STONE_MATERIAL_DAY2,
        );
        that.obstacleUp.castShadow = true;
        that.obstacleUp.receiveShadow = true;
        ramp.add(that.obstacleUp);
        object3d.add(ramp);
        // if (Constants.USE_CANNON) {
        //   let phys = new TrimeshCollider(that.obstacleUp, {});
        //   that.world.physicsWorld.addBody(phys.body); //将刚体添加到物理世界中

        //   let phys2 = new TrimeshCollider(that.obstacleTop, {});
        //   that.world.physicsWorld.addBody(phys2.body); //将刚体添加到物理世界中

        //   let phys3 = new TrimeshCollider(that.obstacleDown, {});
        //   that.world.physicsWorld.addBody(phys3.body); //将刚体添加到物理世界中
        // }
      }

      function drawBarrier(p1, p2) {
        var item = that.createCylinderByTwoPoints(
          new THREE.Vector3(p1.x / 100.0, p1.z / 100.0 - Constants.BASE_H3, -p1.y / 100.0),
          new THREE.Vector3(p2.x / 100.0, p2.z / 100.0 - Constants.BASE_H3, -p2.y / 100.0),
        );
        object3d.add(item);
        // if (Constants.USE_CANNON) {
        //   let phys = new TrimeshCollider(item, {});
        //   that.world.physicsWorld.addBody(phys.body); //将刚体添加到物理世界中
        // }
      }
      function combineRotation(quaternionZ, degreeY) {
        let quaternion0 = new THREE.Quaternion();
        let x, y, z, w, angle, sinAngle;

        //Rotate around Y y轴是竖直方向 逆时针旋转为正
        angle = (degreeY * Math.PI) / 180.0;
        sinAngle = Math.sin(angle / 2.0);
        var rotationAxis = new THREE.Vector3(0, 1, 0);
        x = rotationAxis.x * sinAngle;
        y = rotationAxis.y * sinAngle;
        z = rotationAxis.z * sinAngle;
        w = Math.cos(angle / 2.0);
        quaternion0.set(x, y, z, w);
        quaternion0.multiply(quaternionZ);
        return quaternion0;
      }

      function createParalellepiped(sx, sy, sz, mass, pos, quat, material) {
        const threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
        shape.setMargin(Constants.margin);
        that.createRigidBody(threeObject, shape, mass, pos, quat, undefined);
        return threeObject;
      }
    };

    this.createRoadSign = function (jo) {
      if (jo.roadSignDatas) {
        if (jo.roadSignDatas.length > 0) {
          for (let i = 0; i < jo.roadSignDatas.length; i++) {
            function drawItem(data) {
              that.addRoadSign(
                new THREE.Vector3(
                  data.start.x / 100.0,
                  data.start.z / 100.0 - Constants.BASE_H2 + 1.0,
                  -data.start.y / 100.0,
                ),
                new THREE.Vector3(
                  data.end.x / 100.0,
                  data.end.z / 100.0 - Constants.BASE_H2 + 1.0,
                  -data.end.y / 100.0,
                ),
                that.getRoadSignMaterial(data.type),
              );
            }

            drawItem(jo.roadSignDatas[i]);
          }
          that.hasRoadSignDatas = true;
        } else {
          that.hasRoadSignDatas = false;
        }
      } else {
        that.hasRoadSignDatas = false;
      }
    };

    this.creatTrees = function (jsObject) {
      var mnX = jsObject.startX / 100.0 - outW / 2.0;
      var mxX = jsObject.endX / 100.0 + outW / 2.0;
      var mnY = jsObject.startY / 100.0 - outW / 2.0;
      var mxY = jsObject.endY / 100.0 + outW / 2.0;

      const mtlLoader = new MTLLoader();
      const loader = new OBJLoader();
      mtlLoader.load('trees/Tree.mtl', function (materials) {
        loader.setMaterials(materials);
        loader.load(
          'trees/Tree.obj',
          function (object) {
            object.traverse(function (child) {
              if (child instanceof THREE.Mesh) {
                //child.material.shininess=0;
                //在加载树木模型时，树叶的材质必须是透明的
                child.material.transparent = true;
                // child.shading=THREE.FlatShading
              }
            });

            object.scale.set(30, 30, 30);
            object.name = 'tree';
            var tree1 = object,
              tree2 = object.clone(),
              tree3 = object.clone(),
              tree4 = object.clone();

            tree1.position.set(mnX, 0, mnY);
            that.scene.add(tree1);

            tree2.position.set(mnX, 0, mxY);
            that.scene.add(tree2);

            tree3.position.set(mxX, 0, mnY);
            that.scene.add(tree3);

            tree4.position.set(mxX, 0, mxY);
            that.scene.add(tree4);
          },
          undefined,
          undefined,
        );
      });
    };
  }
};

Scenario.prototype.changeDayAndNight = function (flag) {
  if (flag === 1) {
    // console.log('切换到夜间模式');
    this.graphGroundMesh.material = this.BRICK_STONE_MATERIAL_NIGHT;
    // 添加上下坡道此方法会出现报错 需要添加坡道刚体 BUGFIX
    if (this.obstacleUp && this.obstacleTop && this.obstacleDown) {
      this.obstacleUp.material = this.BRICK_STONE_MATERIAL_NIGHT2;
      this.obstacleTop.material = this.BRICK_STONE_MATERIAL_NIGHT2;
      this.obstacleDown.material = this.BRICK_STONE_MATERIAL_NIGHT2;
    }
  } else {
    console.log('切换到白天模式');
    this.graphGroundMesh.material = this.BRICK_STONE_MATERIAL_DAY;
    // 添加上下坡道此方法会出现报错 需要添加坡道刚体
    if (this.obstacleUp && this.obstacleTop && this.obstacleDown) {
      this.obstacleUp.material = this.BRICK_STONE_MATERIAL_DAY2;
      this.obstacleTop.material = this.BRICK_STONE_MATERIAL_DAY2;
      this.obstacleDown.material = this.BRICK_STONE_MATERIAL_DAY2;
    }
  }
  this.app.renderer.render(this.scene, this.app.camera);
};

Scenario.prototype.initMaterial = function () {
  const loader = new THREE.TextureLoader();
  const that = this;
  var texture = loader.load('fbx/kerb.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.anisotropy = 16;
  texture.encoding = THREE.sRGBEncoding;
  this.KERBS_MATERIAL = new THREE.MeshLambertMaterial({ map: texture });

  //防护矮墙
  texture = loader.load('images/redwhite_s.png');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  texture.encoding = THREE.sRGBEncoding;
  texture.repeat.set(0.1, 3);
  this.PARAPET_MATERIAL = new THREE.MeshLambertMaterial({ map: texture });

  this.RollMat = new THREE.MeshLambertMaterial();
  this.RollTexture = new THREE.TextureLoader().load('images/arrow.png', function (map) {
    that.RollMat.map = map;
    that.RollMat.needsUpdate = true;
    that.RollMat.transparent = true;
    that.RollMat.side = THREE.DoubleSide;
  });
  this.RollTexture.wrapS = this.RollTexture.wrapT = THREE.RepeatWrapping;

  // 地面路标--
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  this.ROADSIGN_DIRECT_MATERIAL = new THREE.MeshLambertMaterial();
  texture = new THREE.TextureLoader().load('images/roadSign_direct.png', function (map) {
    that.ROADSIGN_DIRECT_MATERIAL.map = map;
    that.ROADSIGN_DIRECT_MATERIAL.needsUpdate = true;
    that.ROADSIGN_DIRECT_MATERIAL.transparent = true;
    that.ROADSIGN_DIRECT_MATERIAL.side = THREE.DoubleSide;
  });

  this.ROADSIGN_RIGHT_MATERIAL = new THREE.MeshLambertMaterial();
  texture = new THREE.TextureLoader().load('images/roadSign_right.png', function (map) {
    that.ROADSIGN_RIGHT_MATERIAL.map = map;
    that.ROADSIGN_RIGHT_MATERIAL.needsUpdate = true;
    that.ROADSIGN_RIGHT_MATERIAL.transparent = true;
    that.ROADSIGN_RIGHT_MATERIAL.side = THREE.DoubleSide;
  });

  this.ROADSIGN_LEFT_MATERIAL = new THREE.MeshLambertMaterial();
  texture = new THREE.TextureLoader().load('images/roadSign_left.png', function (map) {
    that.ROADSIGN_LEFT_MATERIAL.map = map;
    that.ROADSIGN_LEFT_MATERIAL.needsUpdate = true;
    that.ROADSIGN_LEFT_MATERIAL.transparent = true;
    that.ROADSIGN_LEFT_MATERIAL.side = THREE.DoubleSide;
  });

  this.ROADSIGN_DIRECTORRIGHT_MATERIAL = new THREE.MeshLambertMaterial();
  texture = new THREE.TextureLoader().load('images/roadSign_directorright.png', function (map) {
    that.ROADSIGN_DIRECTORRIGHT_MATERIAL.map = map;
    that.ROADSIGN_DIRECTORRIGHT_MATERIAL.needsUpdate = true;
    that.ROADSIGN_DIRECTORRIGHT_MATERIAL.transparent = true;
    that.ROADSIGN_DIRECTORRIGHT_MATERIAL.side = THREE.DoubleSide;
  });

  this.ROADSIGN_DIRECTORLEFT_MATERIAL = new THREE.MeshLambertMaterial();
  texture = new THREE.TextureLoader().load('images/roadSign_directorleft.png', function (map) {
    that.ROADSIGN_DIRECTORLEFT_MATERIAL.map = map;
    that.ROADSIGN_DIRECTORLEFT_MATERIAL.needsUpdate = true;
    that.ROADSIGN_DIRECTORLEFT_MATERIAL.transparent = true;
    that.ROADSIGN_DIRECTORLEFT_MATERIAL.side = THREE.DoubleSide;
  });

  this.ROADSIGN_RIGHTBACK_MATERIAL = new THREE.MeshLambertMaterial();
  texture = new THREE.TextureLoader().load('images/roadSign_rightback.png', function (map) {
    that.ROADSIGN_RIGHTBACK_MATERIAL.map = map;
    that.ROADSIGN_RIGHTBACK_MATERIAL.needsUpdate = true;
    that.ROADSIGN_RIGHTBACK_MATERIAL.transparent = true;
    that.ROADSIGN_RIGHTBACK_MATERIAL.side = THREE.DoubleSide;
  });

  this.ROADSIGN_LEFTBACK_MATERIAL = new THREE.MeshLambertMaterial();
  texture = new THREE.TextureLoader().load('images/roadSign_leftback.png', function (map) {
    that.ROADSIGN_LEFTBACK_MATERIAL.map = map;
    that.ROADSIGN_LEFTBACK_MATERIAL.needsUpdate = true;
    that.ROADSIGN_LEFTBACK_MATERIAL.transparent = true;
    that.ROADSIGN_LEFTBACK_MATERIAL.side = THREE.DoubleSide;
  });

  // --地面路标

  texture = loader.load('grasslight-big.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(0.01, 0.01);
  texture.anisotropy = 16;
  texture.encoding = THREE.sRGBEncoding;
  this.GRASS_LIGHT_MATERIAL = new THREE.MeshLambertMaterial({ map: texture });

  texture = loader.load('grasslight-big.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 16;
  texture.encoding = THREE.sRGBEncoding;
  this.GRASS_LIGHT_MATERIAL2 = new THREE.MeshLambertMaterial({ map: texture });

  texture = loader.load('images/ground_white.jpg');
  texture.repeat.set(100, 100);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.encoding = THREE.sRGBEncoding;
  this.BRICK_STONE_MATERIAL_DAY = new THREE.MeshLambertMaterial({
    map: texture,
  });

  texture = loader.load('images/ground_white.jpg');
  texture.repeat.set(5, 5);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.encoding = THREE.sRGBEncoding;
  this.BRICK_STONE_MATERIAL_DAY2 = new THREE.MeshLambertMaterial({
    map: texture,
  });

  texture = loader.load('images/ground_black.jpg');
  texture.repeat.set(100, 100);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.encoding = THREE.sRGBEncoding;
  this.BRICK_STONE_MATERIAL_NIGHT = new THREE.MeshLambertMaterial({
    map: texture,
  });

  texture = loader.load('images/ground_black.jpg');
  texture.repeat.set(5, 5);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.encoding = THREE.sRGBEncoding;
  this.BRICK_STONE_MATERIAL_NIGHT2 = new THREE.MeshLambertMaterial({
    map: texture,
  });

  texture = loader.load('images/ForestFloor-06_COLOR_4k.jpg');
  texture.repeat.set(0.001, 0.001);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.encoding = THREE.sRGBEncoding;
  this.BASE_GROUND_MATERIAL = new THREE.MeshLambertMaterial({ map: texture });
};

Scenario.prototype.getRampRange = function () {
  return this.POLYGON_RAMP_POINTS;
};

Scenario.prototype.updateRollPlane = function (vstart, vend) {
  if (!this.ARROW) {
    this.addRollPlane(vstart, vend);
  } else {
    this.scene.remove(this.ARROW);
    this.ARROW = null;
  }
};

Scenario.prototype.addRollPlane = function (vstart, vend) {
  var distance = vstart.distanceTo(vend);
  if (distance < 90) return; //不显示阈值
  this.ARROW = new THREE.Mesh(this.RollGEOMETRY, this.RollMat);
  this.Rollposition = vend.clone().add(vstart).divideScalar(2);
  this.Rollorientation.lookAt(vstart, vend, new THREE.Vector3(0, 0, 1)); //look at destination
  this.RolloffsetRotation.makeRotationY(Math.PI * 0.5);
  this.Rollorientation.multiply(this.RolloffsetRotation); //combine orientation with rotation transformations
  this.ARROW.applyMatrix4(this.Rollorientation);
  this.ARROW.position.set(this.Rollposition.x, this.Rollposition.y + 0.5, this.Rollposition.z);
  this.scene.add(this.ARROW);
};

Scenario.prototype.updateRollTexture = function () {
  this.RollTexture.offset.x -= 0.01;
};

Scenario.prototype.createTextInMesh = function (message, parameters) {
  if (parameters === undefined) parameters = {};

  /* 字体大小 */
  var fontsize = parameters.hasOwnProperty('fontsize') ? parameters['fontsize'] : 18;

  /* 边框厚度 */
  var borderThickness = parameters.hasOwnProperty('borderThickness') ? parameters['borderThickness'] : 4;

  /* 边框颜色 */
  var borderColor = parameters.hasOwnProperty('borderColor') ? parameters['borderColor'] : { r: 0, g: 0, b: 0, a: 1.0 };

  /* 背景颜色 */
  var backgroundColor = parameters.hasOwnProperty('backgroundColor')
    ? parameters['backgroundColor']
    : { r: 255, g: 255, b: 255, a: 1.0 };

  /* 创建画布 */
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  var fontface = parameters.hasOwnProperty('fontface') ? parameters['fontface'] : 'Arial';
  /* 字体加粗 */
  context.font = 'Bold ' + fontsize + 'px ' + fontface;

  /* 获取文字的大小数据，高度取决于文字的大小 */
  var metrics = context.measureText(message);
  var textWidth = metrics.width;

  /* 背景颜色 */
  context.fillStyle =
    'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';

  /* 边框的颜色 */
  context.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';
  context.lineWidth = borderThickness;

  /* 绘制圆角矩形 */
  this.roundRect(
    context,
    borderThickness / 2,
    borderThickness / 2,
    textWidth + borderThickness,
    fontsize * 1.4 + borderThickness,
    30,
  ); //r 圆角半径 6

  /* 字体颜色 */
  var fillStyle = parameters.hasOwnProperty('fillStyle') ? parameters['fillStyle'] : { r: 0, g: 0, b: 0, a: 1.0 };
  context.fillStyle = 'rgba(' + fillStyle.r + ',' + fillStyle.g + ',' + fillStyle.b + ',' + fillStyle.a + ')'; //fix
  context.fillText(message, borderThickness, fontsize + borderThickness);

  /* 画布内容用于纹理贴图 */
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  let material = new THREE.MeshBasicMaterial({
    map: texture,
    flatShading: true,
    transparent: true,
    opacity: 1,
  });
  var geometry = new THREE.PlaneGeometry(15, 5);
  let textMesh1 = new THREE.Mesh(geometry, material);
  return textMesh1;
};

Scenario.prototype.createCylinderByTwoPoints = function (vstart, vend) {
  var distance = vstart.distanceTo(vend);
  let radius = 2.5;
  var cylinder = new THREE.CylinderGeometry(radius, radius, distance, 4, 4, false);
  // console.log(distance)

  var material = undefined;
  // if(distance > 120.0){
  //     material = this.PARAPET_MATERIAL;
  // }else {
  var texture = new THREE.TextureLoader().load('images/redwhite_s.png');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  texture.encoding = THREE.sRGBEncoding;
  texture.repeat.set(0.1, (3.2 * distance) / 120.0);
  material = new THREE.MeshLambertMaterial({ map: texture });
  // }

  var mesh = new THREE.Mesh(cylinder, material); //todo fix
  let quaternion = new THREE.Quaternion();
  var dir = new THREE.Vector3().copy(vend).sub(vstart).normalize();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  let quaternion0 = new THREE.Quaternion();
  let x, y, z, w, angle, sinAngle;
  //Rotate around Y y轴是竖直方向 逆时针旋转为正
  angle = (45.0 * Math.PI) / 180.0;
  sinAngle = Math.sin(angle / 2.0);
  var rotationAxis = new THREE.Vector3(0, 1, 0);
  x = rotationAxis.x * sinAngle;
  y = rotationAxis.y * sinAngle;
  z = rotationAxis.z * sinAngle;
  w = Math.cos(angle / 2.0);
  quaternion0.set(x, y, z, w);
  quaternion.multiply(quaternion0);
  mesh.applyQuaternion(quaternion);
  var middle = new THREE.Vector3().copy(vstart).lerp(vend, 0.5);
  mesh.position.copy(middle);
  mesh.position.y += radius / 2.0;
  return mesh;
};

Scenario.prototype.createCylinderByTwoPoints2 = function (vstart, vend) {
  var HALF_PI = Math.PI * 0.5;
  var distance = vstart.distanceTo(vend);
  var position = vend.clone().add(vstart).divideScalar(2);
  var cylinder = new THREE.CylinderGeometry(1.5, 1.5, distance, 4, 4, false);
  var orientation = new THREE.Matrix4(); //a new orientation matrix to offset pivot
  var offsetRotation = new THREE.Matrix4(); //a matrix to fix pivot rotation
  // var offsetPosition = new THREE.Matrix4(); //a matrix to fix pivot position
  orientation.lookAt(vstart, vend, new THREE.Vector3(0, 1, 0)); //look at destination
  offsetRotation.makeRotationX(HALF_PI); //rotate 90 degs on X
  orientation.multiply(offsetRotation); //combine orientation with rotation transformations
  cylinder.applyMatrix4(orientation);
  var mesh = new THREE.Mesh(cylinder, this.KERBS_MATERIAL);
  mesh.position.set(position.x, position.y, position.z);
  return mesh;
};

/* 绘制圆角矩形 */
Scenario.prototype.roundRect = function (ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

Scenario.prototype.addRoadSign = function (vstart, vend, material) {
  this.ROADSIGN = new THREE.Mesh(this.RoadSignGEOMETRY, material);
  this.ROADSIGN.name = 'obstacle';
  this.RoadSignposition = vend.clone().add(vstart).divideScalar(2);
  this.RoadSignorientation.lookAt(vstart, vend, new THREE.Vector3(0, 0, 1)); //look at destination
  this.RoadSignoffsetRotation.makeRotationY(Math.PI * 0.5);
  this.RoadSignorientation.multiply(this.RoadSignoffsetRotation); //combine orientation with rotation transformations
  this.ROADSIGN.applyMatrix4(this.RoadSignorientation);
  this.ROADSIGN.position.set(this.RoadSignposition.x, this.RoadSignposition.y + 0.5, this.RoadSignposition.z);
  this.scene.add(this.ROADSIGN);
};

Scenario.prototype.createRigidBody = function (threeObject, physicsShape, mass, pos, quat, name) {
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

Scenario.prototype.drawSLinesFromArr = function (points, name, material) {
  var geometry = new THREE.Geometry();
  for (let i = 0; i < points.length; i++) {
    geometry.vertices.push(new THREE.Vector3(points[i][0], 1.0, points[i][1]));
  }
  geometry.vertices.push(new THREE.Vector3(points[0][0], 1.0, points[0][1])); //loop
  var line = new THREE.Line(geometry, material);
  line.name = name;
  this.scene.add(line);
};
Scenario.prototype.fastGrasses2 = function (array, textureUrl) {
  var positions = new Array(array.length);
  for (var i = 0; i < array.length; i++) {
    var position = new THREE.Vector3();
    position.x = array[i].x;
    position.z = -array[i].y;
    positions[i] = position;
  }
  var fastGrass = THREEx.FastGrass(positions);
  var material = fastGrass.material;
  material.map = THREE.ImageUtils.loadTexture(textureUrl);
  material.emissive.set(0x888888);
  material.alphaTest = 0.7;
  return fastGrass;
};

Scenario.prototype.addRoadSign = function (vstart, vend, material) {
  let ROADSIGN = new THREE.Mesh(this.RoadSignGEOMETRY, material);
  ROADSIGN.name = 'road_sign';
  this.RoadSignposition = vend.clone().add(vstart).divideScalar(2);
  this.RoadSignorientation.lookAt(vstart, vend, new THREE.Vector3(0, 0, 1)); //look at destination
  this.RoadSignoffsetRotation.makeRotationY(Math.PI * 0.5);
  this.RoadSignorientation.multiply(this.RoadSignoffsetRotation); //combine orientation with rotation transformations
  ROADSIGN.applyMatrix4(this.RoadSignorientation);
  ROADSIGN.position.set(this.RoadSignposition.x, this.RoadSignposition.y + 0.5, this.RoadSignposition.z);
  this.scene.add(ROADSIGN);
};
Scenario.prototype.getRoadSignMaterial = function (type) {
  if (type === 'roadSign_direct') {
    return this.ROADSIGN_DIRECT_MATERIAL;
  } else if (type === 'roadSign_left') {
    return this.ROADSIGN_LEFT_MATERIAL;
  } else if (type === 'roadSign_right') {
    return this.ROADSIGN_RIGHT_MATERIAL;
  } else if (type === 'roadSign_directorleft') {
    return this.ROADSIGN_DIRECTORLEFT_MATERIAL;
  } else if (type === 'roadSign_directorright') {
    return this.ROADSIGN_DIRECTORRIGHT_MATERIAL;
  } else if (type === 'roadSign_leftback') {
    return this.ROADSIGN_LEFTBACK_MATERIAL;
  } else if (type === 'roadSign_rightback') {
    return this.ROADSIGN_RIGHTBACK_MATERIAL;
  }
  return this.ROADSIGN_DIRECT_MATERIAL;
};
