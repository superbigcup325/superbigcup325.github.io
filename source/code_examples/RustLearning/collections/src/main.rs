fn main() {
    println!("Run individual examples with: cargo run --bin <name>");
    println!("Available binaries:");
    println!("  01_vector_create    - Vector 声明：Vec::new 与 vec! 宏");
    println!("  02_vector_update    - Vector 增删改查");
    println!("  03_vector_iterate   - Vector 遍历、迭代器 next 与 Range");
    println!("  04_string_vs_str    - String 与 &str 的区别、UTF-8 编码");
    println!("  05_string_create    - 创建字符串");
    println!("  06_string_update    - push_str / push / + / format!");
    println!("  07_string_index     - 为什么 String 不能索引、三种视角");
    println!("  08_string_slice     - 对 String 切片");
    println!("  09_hashmap_create   - HashMap 创建：new 与 collect");
    println!("  10_hashmap_access   - HashMap 访问、遍历与所有权");
    println!("  11_hashmap_update   - HashMap 更新：insert / or_insert");
}
