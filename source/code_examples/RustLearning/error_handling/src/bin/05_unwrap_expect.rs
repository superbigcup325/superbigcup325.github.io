use std::fs;
use std::fs::File;
use std::net::IpAddr;

fn main() {
    // 先确保 hello.txt 存在，让 unwrap / expect 走成功分支
    fs::write("hello.txt", "ferris\n").expect("failed to write hello.txt");

    // unwrap：Ok 返回内部值，Err 直接 panic
    let f = File::open("hello.txt").unwrap();
    println!("file handle: {:?}", f);

    // expect：同 unwrap，但 panic 消息可自定义
    let f2 = File::open("hello.txt").expect("hello.txt should be included in this project");
    println!("file handle: {:?}", f2);

    // 硬编码合法 IP，逻辑上必然成功，用 expect 说明理由
    let home: IpAddr = "127.0.0.1"
        .parse()
        .expect("Hardcoded IP address should be valid");
    println!("ip: {home}");
}