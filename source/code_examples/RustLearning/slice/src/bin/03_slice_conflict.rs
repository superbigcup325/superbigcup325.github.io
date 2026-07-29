fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    &s[..]
}

fn main() {
    let mut s = String::from("Hello world!");
    let word = first_word(&s);
    // s.clear();  // 编译错误：word 还在借用 s
    println!("The first word is: {word}");
    // word 的生命周期在此结束，之后 s 可以修改
    s.clear();
    println!("After clear: '{s}'");
}
