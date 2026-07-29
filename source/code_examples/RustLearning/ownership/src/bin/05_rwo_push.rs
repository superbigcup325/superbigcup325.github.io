fn main() {
    let mut v = vec![1, 2, 3, 4, 5];
    let num = &v[0];
    println!("{}", *num);
    // v.push(6);  // 编译错误：v 被不可变借用，无法修改
}
