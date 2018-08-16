class Cat {
    constructor() {
        return this.method_1()
    }
    method_1(){
        return this.method_2()
    }
    method_2(){
        return this.method_3()
    }
    method_3(){
        return false;
    }
}

module.exports = Cat