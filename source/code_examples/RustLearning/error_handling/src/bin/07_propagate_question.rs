use std::fs;
use std::fs::File;
use std::io::{self, Read};

// 用 ? 运算符传播错误，与 06 的功能相同但简洁得多
fn read_username_from_file() -> Result<String, io::Error> {
    let mut username_file = File::open("hello.txt")?;
    let mut username = String::new();
    username_file.read_to_string(&mut username)?;
    Ok(username)
}

fn main() {
    fs::write("hello.txt", "ferris\n").expect("failed to write hello.txt");

    match read_username_from_file() {
        Ok(name) => println!("username: {name}"),
        Err(e) => println!("error: {e}"),
    }
}