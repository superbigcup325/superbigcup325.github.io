fn main() {
    let mut v = vec![1, 2, 3, 4, 5];
    let num = &mut v[2];
    let num2 = &*num;  // 降级为不可变引用
    println!("{}", num2);
}
