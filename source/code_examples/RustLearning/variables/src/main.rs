fn main() {
    // 不可变(immutable)变量的声明
    // 在后续无法够对变量进行任何的修改操作
    let number = 42;

    // 可变(mutable)变量的声明
    let mut value = 36;
    value = 42;
    value += 1;

    // shadowing, Rust允许在后文声明相同名字的变量来覆盖前面的变量
    let message = "   ";
    let message = message.len();

    // 常量的声明方式，注意此处需要显式指定类型
    const MAX_POINT: u32 = 100_000;  // 此处可以使用下划线增加代码可读性，并不影响实际值
    const PI: f64 = 3.14;

    // 当类型不确定时，需要显式声明类型
    let num: i32 = "42".parse().expect("not a number");
    
    // tuple的声明方式
    let tup: (i32, u8, f64) = (114, 5, 0.14);
    // 获取tuple元素
    let (x, y, z) = tup;
    // 如何调用  (0-based)
    println!("{}, {}, {}", x, y, z);
    println!("{}, {}, {}", tup.0, tup.1, tup.2);
    // 输出均为 114， 5, 0.14

    // array的声明方式
    let arr: [i32; 5] = [1, 2, 3, 4, 5];
    println!("{:?}", arr); // [1, 2, 3, 4, 5]
}
