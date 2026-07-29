fn main() {
    let mut v = vec![1, 2, 3];
    {
        let num = &v[2];
        println!("{num}");  // 引用在此结束
    }
    v.push(4);              // 借用已结束，可以修改
    println!("{v:?}");
}
