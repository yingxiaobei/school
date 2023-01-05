import { Car } from './car.js';

export class CarManager {
  constructor(lib) {
    this.lib = lib;
    this.currentIndex = '';
    this.currentCar = new Car(this.lib, 1);
    this.list = [];
    this.list.push(this.currentCar);
  }

  current() {
    for (let i = 0; i < this.list.length; i++) {
      if (this.currentIndex === '') {
        this.currentIndex = this.list[0].index;
        return this.list[0];
      }
      if (this.list[i].index === this.currentIndex) {
        return this.list[i];
      }
    }
    return this.currentCar;
  }

  setCurrentIndex(index) {
    this.currentIndex = index;
  }

  // 获取当前选中车的号码
  getCurrentIndex() {
    return this.currentIndex;
  }

  add(index, originData) {
    if (index !== 0) {
      var car = new Car(this.lib, index, originData);
      this.list.push(car);
    }
  }

  loadAll(path, scene, camera, onProgress, onError) {
    this.list[0].load(path, camera, onProgress, onError);
    this.list[0].setScene(scene);

    for (let i = 1; i < this.list.length; i++) {
      this.list[i].load(path, camera, undefined, undefined);
      this.list[i].setScene(scene);
    }
  }

  getAll() {
    return this.list;
  }
}
