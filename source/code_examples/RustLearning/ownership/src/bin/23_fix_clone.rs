fn main() {
    let mut v = vec![1, 2, 3];
    let num = v[2].clone(); // 深拷贝，不持有 v 的引用
    v.push(4);
    println!("{num}");
    println!("{v:?}");
}
