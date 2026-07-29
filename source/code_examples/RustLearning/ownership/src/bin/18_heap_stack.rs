fn main() {
    let v = vec![1, 2, 3, 4, 5];
    let n_ref = &v[0];
    let n = *n_ref;  // i32 实现了 Copy，解引用复制值
    println!("{n}");

    let v = vec![String::from("hello"), String::from("world")];
    let s_ref = &v[0];
    // let s = *s_ref;  // 编译错误：String 没有实现 Copy
    println!("{s_ref}");
}
