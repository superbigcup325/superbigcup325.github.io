fn last_char_of_first_line(text: &str) -> Option<char> {
    // lines() 按行迭代，next() 取第一行（可能 None，用 ? 提前返回）
    // chars().last() 取最后一个字符
    text.lines().next()?.chars().last()
}

fn main() {
    assert_eq!(
        last_char_of_first_line("Hello, world\nHow are you today?"),
        Some('d')
    );
    assert_eq!(last_char_of_first_line(""), None);
    assert_eq!(last_char_of_first_line("\nhi"), None);

    println!("all assertions passed");
}