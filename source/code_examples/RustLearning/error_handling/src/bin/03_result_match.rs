use std::fs::File;

fn main() {
    // File::open 返回 Result<File, io::Error>
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
        Err(error) => panic!("Problem opening the file: {error:?}"),
    };

    println!("file handle: {:?}", greeting_file);
}
