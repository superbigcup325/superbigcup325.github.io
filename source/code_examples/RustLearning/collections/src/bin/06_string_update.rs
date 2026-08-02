fn main() {
    // push_str：追加字符串切片
    let mut s = String::from("foo");
    s.push_str("bar");
    println!("s: {s}");

    // push：追加单个字符
    s.push('!');
    println!("s: {s}");

    // +：连接，s1 的所有权被移动
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &s2; // add(self, s: &str)
    println!("s3: {s3}");
    // println!("{s1}"); // 编译错误：s1 已被移动

    // format!：不夺取所有权
    let a = String::from("tic");
    let b = String::from("tac");
    let c = String::from("toe");
    let game = format!("{a}-{b}-{c}");
    println!("game: {game}");
    println!("a, b, c 仍然可用: {a} {b} {c}");
}
