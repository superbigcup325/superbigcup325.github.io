fn main() {
    let s1 = String::from("hello");
    let s2 = s1;     // 移动，s1 失效
    // println!("{s1}");  // 编译错误：value used after move
    println!("{s2}");
}
