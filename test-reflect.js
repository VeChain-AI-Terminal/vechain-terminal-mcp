import 'reflect-metadata';

class TestParams {
  static schema = 'test-schema';
  constructor(params) {
    this.params = params;
  }
}

class TestClass {
  testMethod(param1, param2) {
    return 'test';
  }
}

console.log('Testing reflect-metadata...');

const paramTypes = Reflect.getMetadata('design:paramtypes', TestClass.prototype, 'testMethod');
console.log('Parameter types:', paramTypes);

if (!paramTypes) {
  console.log('reflect-metadata is not working properly');
} else {
  console.log('reflect-metadata is working');
}