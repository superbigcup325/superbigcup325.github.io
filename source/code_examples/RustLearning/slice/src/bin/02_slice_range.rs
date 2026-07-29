fn main() {
    let s = String::from("hello world");

    let hello = &s[0..5];
    let world = &s[6..11];
    println!("{hello} {world}");

    // 简写
    let hello = &s[..5];    // 从开头到 5
    let world = &s[6..];    // 从 6 到末尾
    let whole = &s[..];     // 整个字符串
    println!("{hello} {world}");
    println!("whole: {whole}");
}
