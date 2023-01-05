const getKeyValue = <T extends object, U extends keyof T>(key: U) => (obj: T) => obj[key];

// Rest Parameters
function buildName(firstName: string, ...restOfName: string[]) {
  return firstName + ' ' + restOfName.join(' ');
}
// employeeName will be "Joseph Samuel Lucas MacKinzie"
let employeeName = buildName('Joseph', 'Samuel', 'Lucas', 'MacKinzie');

var clientData = {
  id: 096545,
  fullName: 'Not Set',
  //setUsrName是一个在clientData对象中的方法
  setUserName: function (firstName, lastName) {
    this.fullName = firstName + ' ' + lastName;
  },
};

function getUserInput(firstName, lastName, callback) {
  //code .....

  //调用回调函数存储
  callback(firstName, lastName);
}

getUserInput('Barack', 'Obama', clientData.setUserName);

console.log(clientData.fullName); //Not Set

console.log(window.fullName); //Barack Obama

function identity<T>(value: T): T {
  return value;
}

console.log(identity<Number>(1)); // 1

// K（Key）：表示对象中的键类型；
// V（Value）：表示对象中的值类型；
// E（Element）：表示元素类型。

function identity2<T, U>(value: T, message: U): T {
  console.log(message);
  return value;
}

console.log(identity2(68, 'Semlinker'));

function identity3<T, U>(value: T, message: U): [T, U] {
  return [value, message];
}

interface Length {
  length: number;
}

function identity4<T extends Length>(arg: T): T {
  console.log(arg.length); // 可以获取length属性
  return arg;
}

interface Person {
  name: string;
  age: number;
  location: string;
}

type K1 = keyof Person; // "name" | "age" | "location"
type K2 = keyof Person[]; // number | "length" | "push" | "concat" | ...
type K3 = keyof { [x: string]: Person }; // string | number

// Partial<T> 的作用就是将某个类型里的属性全部变为可选项 ?

// Pick<T, K extends keyof T> 的作用是将某个类型中的子属性挑出来，变成包含这个类型部分属性的子类型。

// Exclude<T, U> 的作用是将某个类型中属于另一个的类型移除掉。
