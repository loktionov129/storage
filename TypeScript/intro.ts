// (1) абстрактный класс
abstract class Animal
{
    // (2) приватные свойства
    // (3) статическое свойство класса
    private static animalCounter: number = 0;
  
    // (4) защищенные свойства и методы
    protected name: string;
    protected age: number;
  
    protected OnYearPassed(): number
    {
        return ++this.age;
    }
  
    // публичные методы
    public GetName(): string { return this.name; }
    public GetAge(): number { return this.age; }
  
    // (5) "абстрактный" метод
    public abstract SayHello(): void;
  
    public constructor(name: string = "unnamed", age: number = 0)
    {
        this.name = name;
        this.age = age;
    }
}
 
class Cat extends Animal
{
    private static catCounter: number = 0;
    protected breed: string;
    public GetBreed(): string { return this.breed; }
    public SayHello(): void { console.log(""); }
 
    // (7) вызов конструктора базового класса
    // с передачей в него параметров
    public constructor(name: string = "unnamed", age: number, breed: string = "uknown")
    {
        super(name, age);
        this.breed = breed;
        //console.log(`++catCounter: ${++Cat.catCounter}`);
        let str = `++catCounter: ${++Cat.catCounter}`;
        //document.getElementById("output").innerHTML += "<br />" + str;
        console.log(str);
    }
}
 
enum Type
{
    LAZY, ANGRY
}
 
// еще одно животное
// класс аналогичен классу Cat
class Dog extends Animal
{
    private static dogCounter: number = 0;
    protected type: Type;
    public GetType(): Type { return this.type; }
    public SayHello(): void { console.log("WOOF!"); }
    public constructor(name: string = "unnamed", age: number = 0, type: Type = Type.LAZY)
    {
        super(name, age);
        //console.log(`++dogCounter: ${++Dog.dogCounter}`);
        let str = `++dogCounter: ${++Dog.dogCounter}`;
        //document.getElementById("output").innerHTML += "<br />" + str;
        console.log(str);
    }
}
 
// let animal = new Animal("anim", 3);
// [ts] Cannot create an instance of the abstract class 'Animal'
 
let beagley = new Dog("Beagley", 3);
let sammy = new Cat("Sammy", 3, "Siamese");
