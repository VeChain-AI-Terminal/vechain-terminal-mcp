import 'reflect-metadata';

class TestParams {
  static schema = 'test-schema';
  constructor(public readonly params: any) {}
}

class TestClass {
  testMethod(param1: string, param2: TestParams): string {
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
  console.log('Parameter types count:', paramTypes.length);
  paramTypes.forEach((type: any, index: number) => {
    console.log(`Parameter ${index}:`, type);
  });
}