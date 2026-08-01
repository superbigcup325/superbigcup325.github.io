fn main() {
    println!("Run individual examples with: cargo run --bin <name>");
    println!("Available binaries:");
    println!("  01_inline_module  - 内联模块声明");
    println!("  02_single_file    - 单文件模块声明（garden.rs）");
    println!("  03_mod_dir        - 目录模块声明（garden/mod.rs）");
    println!("  04_paths          - 绝对路径、相对路径与 super");
    println!("  05_visibility     - struct/enum 字段可见性");
    println!("  06_use            - use 引入、嵌套路径与 as 别名");
    println!("  07_pub_use        - pub use 重导出（使用 lib.rs）");
    println!();
    println!("库代码见 src/lib.rs，通过 cargo build 编译");
}
