fn main() {
    let s = String::from("नमस्ते");

    // 字节视角：每个字节
    println!("bytes: {:?}", s.bytes().collect::<Vec<_>>());

    // 标量值视角：每个 Unicode 标量值
    println!("chars: {:?}", s.chars().collect::<Vec<_>>());

    // 一个单词三种视角得到的结果完全不同
    println!("字节数: {}", s.len());
    println!("标量值个数: {}", s.chars().count());

    // String 不支持索引访问
    // let b = &s[0]; // 编译错误：String 不能被索引
    // &s[0] 取出的是"你"的第一个字节，不是字符
    let zh = String::from("你好");
    println!("zh 第 0 个字节: {:?}", zh.as_bytes()[0]);
}
