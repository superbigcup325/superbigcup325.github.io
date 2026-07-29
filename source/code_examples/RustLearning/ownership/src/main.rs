fn main() {
    println!("Run individual examples with: cargo run --bin <name>");
    println!("Available binaries:");
    println!("  01_move            - 移动语义：传参导致所有权转移");
    println!("  02_move_return     - 修复：函数返回所有权");
    println!("  03_greet_ref       - 修复：使用引用传参");
    println!("  04_deref           - 解引用与隐式转换");
    println!("  05_rwo_push        - RWO：不可变借用期间无法修改");
    println!("  06_rwo_order       - RWO：调整顺序修复");
    println!("  07_rwo_mut         - RWO：可变引用");
    println!("  08_rwo_downgrade   - RWO：可变引用降级为不可变");
    println!("  09_rwo_return      - RWO：权限在生命周期结束后归还");
    println!("  10_rwo_capitalize  - RWO：条件分支中的权限归还");
    println!("  11_drop_ref        - 数据必须比其所有引用活得更久");
    println!("  12_flow_first      - 流动权限：返回引用");
    println!("  13_flow_first_or   - 流动权限：生命周期标注");
    println!("  14_fix_return      - 修复：返回所有权");
    println!("  15_fix_static      - 修复：static 字符串字面量");
    println!("  16_fix_rc          - 修复：Rc 共享所有权");
    println!("  17_fix_mutable     - 修复：可变引用写入");
    println!("  18_heap_stack      - Copy 与 Move 的区别");
    println!("  19_box_move        - Box 移动：只复制指针");
    println!("  20_move_assign     - 赋值导致移动");
    println!("  21_mut_ref_fn      - 可变引用传参");
    println!("  22_fix_scope       - 修复：作用域限制");
    println!("  23_fix_clone       - 修复：克隆数据");
}
