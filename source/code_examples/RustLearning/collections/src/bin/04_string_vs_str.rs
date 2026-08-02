fn main() {
    // String：可变、拥有所有权，内容在堆上
    let mut s = String::from("hello");
    s.push_str(", world!");
    println!("s: {s}");

    // &str：不可变借用，字符串字面值的类型就是 &str
    let lit: &str = "hello";
    println!("lit: {lit}");

    // &String 通过 deref coercion 自动转为 &str
    let s2 = String::from("abc");
    let t: &str = &s2;
    println!("t: {t}");

    // UTF-8 编码：每个字符占用的字节数不固定
    // 'h' 1 字节，' ' 1 字节，'你' 3 字节，'好' 3 字节
    let zh = String::from("hello 你好");
    println!("len of 'hello 你好' = {}", zh.len());
}
