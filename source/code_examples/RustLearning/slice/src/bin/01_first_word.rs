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
    let s = String::from("Hello world!");
    let word = first_word(&s);
    println!("The first word is: {word}");

    // &String 自动转换为 &str（deref coercion）
    let word2 = first_word(&s);
    println!("Also: {word2}");

    // &str 直接传入
    let word3 = first_word("foo bar");
    println!("Direct &str: {word3}");
}
