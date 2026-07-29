fn main() {
    let s = String::from("hello world");
    let s_ref = &s;
    // drop(s);             // 编译错误：s 被借用，无法释放
    println!("{}", s_ref);
}
