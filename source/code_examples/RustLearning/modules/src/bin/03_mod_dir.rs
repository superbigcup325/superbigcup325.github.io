// 声明方式三：目录模块
// #[path] 指定模块文件位于当前文件同名的目录下：
//   src/bin/03_mod_dir/garden/mod.rs
// 目录风格适合模块下有多个子文件的情况，旧项目常见
#[path = "03_mod_dir/garden/mod.rs"]
mod garden;

fn main() {
    let plant = garden::vegetables::Asparagus {};
    println!("I'm growing {plant:?}!");
}
