// 声明方式一：inline 内联，模块定义在同一个文件中
mod garden {
    pub mod vegetables {
        #[derive(Debug)]
        pub struct Asparagus {}
    }
}

fn main() {
    let plant = garden::vegetables::Asparagus {};
    println!("I'm growing {plant:?}!");
}
