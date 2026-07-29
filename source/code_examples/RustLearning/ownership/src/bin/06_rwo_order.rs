fn main() {
    let mut v = vec![1, 2, 3, 4, 5];
    let num = &v[0];
    println!("{}", *num);  // 用完引用
    v.push(6);            // 引用已结束，可以修改
    println!("{:?}", v);
}
