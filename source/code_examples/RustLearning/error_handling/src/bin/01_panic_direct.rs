fn main() {
    println!("about to panic...");

    // 显式调用 panic! 宏，程序打印失败信息、unwind（展开栈清理数据）、退出
    panic!("crash and burn");
}
