fn main() {
    // 切片必须落在字符边界上，否则 panic
    let s = String::from("hello 世界");

    let hello = &s[0..5]; // "hello"
    println!("hello: {hello}");

    let world = &s[6..12]; // "世界"，每个中文字符 3 字节
    println!("world: {world}");

    // let bad = &s[0..7]; // panic：7 位于"世"的字节中间，不是字符边界
}
