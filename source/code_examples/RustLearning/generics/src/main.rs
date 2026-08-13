fn main() {
    println!("Run individual examples with: cargo run --bin <name>");
    println!("Available binaries:");
    println!("  01_function_generic  - 泛型函数：largest 在 &[T] 中找最大值");
    println!("  02_struct_generic    - struct 泛型：Point<T>，x、y 同类型");
    println!("  03_multi_type_params - 多泛型参数：Point<T, U>，x、y 类型可不同");
    println!("  04_method_generic    - 方法泛型：impl<T> 方法与具体类型 impl");
    println!("  05_monomorphization  - 单态化：编译期展开为具体类型");
}
