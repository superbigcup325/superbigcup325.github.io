fn main() {
    println!("Run individual examples with: cargo run --bin <name>");
    println!("Available binaries:");
    println!("  01_panic_direct         - 显式调用 panic! 宏");
    println!("  02_panic_out_of_bounds  - 越界访问 Vector 触发 panic");
    println!("  03_result_match         - 用 match 处理 Result");
    println!("  04_errorkind_match      - ErrorKind 嵌套匹配，分情况处理");
    println!("  05_unwrap_expect        - unwrap / expect 快捷方法");
    println!("  06_propagate_match      - 用 match 手动传播错误");
    println!("  07_propagate_question   - 用 ? 运算符传播错误");
    println!("  08_question_option      - ? 用在 Option 上");
    println!("  09_main_result          - main 返回 Result<(), Box<dyn Error>>");
}