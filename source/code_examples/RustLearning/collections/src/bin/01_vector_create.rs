fn main() {
    // Vec::new() 声明空 Vector，元素类型需由注解或后续 push 推断
    let mut v: Vec<i32> = Vec::new();
    v.push(1);
    println!("v: {:?}", v);

    // vec! 宏：由编译器从元素推断类型
    let v2 = vec![1, 2, 3];
    println!("v2: {:?}", v2);

    // vec! 也可以创建空 Vector
    let v3: Vec<i32> = vec![];
    println!("v3 is empty: {}", v3.is_empty());
}
