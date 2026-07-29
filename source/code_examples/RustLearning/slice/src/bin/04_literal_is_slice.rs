fn main() {
    // 字符串字面值的类型是 &str
    let s: &str = "Hello world!";
    println!("{s}");

    // 它指向程序二进制文件中的数据，因此不可变
    // s.push_str("extra");  // 编译错误：&str 不可变
}
