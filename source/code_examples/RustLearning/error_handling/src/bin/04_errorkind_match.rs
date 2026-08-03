use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
        Err(error) => match error.kind() {
            // 文件不存在：尝试创建，创建成功返回新句柄
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {e:?}"),
            },
            // 其他错误（如无权限）：一律 panic
            _ => panic!("Problem opening the file: {error:?}"),
        },
    };

    println!("file handle: {:?}", greeting_file);
}
