// use 关键字：把路径引入作用域，简化调用
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

// 惯例：函数用父模块路径引入
use crate::front_of_house::hosting;

// 嵌套路径：一行引入多个同前缀项
use std::cmp::Ordering;
use std::io::{self, Write};
// 等价于：
// use std::io;
// use std::io::Write;

// as 别名：解决同名冲突
use std::fmt::Result as FmtResult;

fn main() {
    hosting::add_to_waitlist(); // 不需要写全路径

    // io 与 io::Write 都被引入，可以直接调用 write_all
    let _ = io::stdout().write_all(b"hello\n");
    let _: Option<FmtResult> = None;
    let _ = Ordering::Equal;
}
