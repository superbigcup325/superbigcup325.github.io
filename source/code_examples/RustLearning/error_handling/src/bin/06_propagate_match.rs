use std::fs;
use std::fs::File;
use std::io::{self, Read};

// 用 match 手动传播错误：两个失败点都返回 Err 给调用方
fn read_username_from_file() -> Result<String, io::Error> {
    let username_file_result = File::open("hello.txt");

    let mut username_file = match username_file_result {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut username = String::new();

    match username_file.read_to_string(&mut username) {
        Ok(_) => Ok(username),
        Err(e) => Err(e),
    }
}

fn main() {
    fs::write("hello.txt", "ferris\n").expect("failed to write hello.txt");

    match read_username_from_file() {
        Ok(name) => println!("username: {name}"),
        Err(e) => println!("error: {e}"),
    }
}