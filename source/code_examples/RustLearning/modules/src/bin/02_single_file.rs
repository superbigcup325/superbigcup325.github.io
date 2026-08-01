// 声明方式二：单文件模块
// #[path] 指定模块文件位于当前文件同名的目录下：
//   src/bin/02_single_file/garden.rs
// 在正式项目中模块文件通常直接放在 src/ 下，如 src/garden.rs
#[path = "02_single_file/garden.rs"]
mod garden;

fn main() {
    let plant = garden::vegetables::Asparagus {};
    println!("I'm growing {plant:?}!");
}
