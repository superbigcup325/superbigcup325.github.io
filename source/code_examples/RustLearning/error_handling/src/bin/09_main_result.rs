use std::error::Error;
use std::fs::{self, File};

// main 返回 Result<(), Box<dyn Error>>，? 的 Err 会经 From 转换为 Box<dyn Error>
// Ok(()) 退出码 0，Err 退出码非 0（与 C 程序约定一致）
fn main() -> Result<(), Box<dyn Error>> {
    fs::write("hello.txt", "ferris\n")?;

    let greeting_file = File::open("hello.txt")?;
    println!("file handle: {:?}", greeting_file);

    Ok(())
}