fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // for 遍历：不可变借用
    for i in &v {
        print!("{i} ");
    }
    println!();

    // 可变遍历：修改元素
    let mut v = v;
    for i in &mut v {
        *i *= 10;
    }
    println!("v: {:?}", v);

    // 迭代器：iter() 返回引用，next() 每次取下一个元素，取完返回 None
    let v = vec![1, 2, 3];
    let mut it = v.iter();
    println!("{:?}", it.next());
    println!("{:?}", it.next());
    println!("{:?}", it.next());
    println!("{:?}", it.next());

    // Range：一段数字区间，也实现了迭代器
    for i in 1..=5 {
        print!("{i} ");
    }
    println!();

    for i in (0..5).rev() {
        print!("{i} ");
    }
    println!();
}
