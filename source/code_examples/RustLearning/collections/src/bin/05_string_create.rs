fn main() {
    // String::from()
    let s1 = String::from("hello");
    println!("s1: {s1}");

    // to_string()：与 String::from 等价
    let s2 = "hello".to_string();
    println!("s2: {s2}");

    // String::new()：空字符串
    let mut s3 = String::new();
    s3.push_str("content");
    println!("s3: {s3}");

    // 字面值的类型是 &str，不可变
    let s4 = "hello";
    // s4.push_str("!");  // 编译错误：&str 没有 push_str 方法
    println!("s4: {s4}");
}
