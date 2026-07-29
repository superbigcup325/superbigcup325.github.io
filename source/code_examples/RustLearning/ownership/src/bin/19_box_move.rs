fn main() {
    let a = Box::new([0; 5]);  // 堆上分配数组
    let b = a;                  // 移动：只复制指针，a 失效
    // println!("{:?}", a);     // 编译错误：a 已被移动
    println!("b[0] = {}", b[0]);
}
