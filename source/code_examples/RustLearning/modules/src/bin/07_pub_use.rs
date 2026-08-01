// pub use 重导出：本 bin 作为 library crate（modules）的使用者
// 调用 lib.rs 中通过 pub use 重导出的 hosting 模块
use modules::hosting;
use modules::eat_at_restaurant;

fn main() {
    // 通过重导出的短路径访问
    hosting::add_to_waitlist();

    // 调用 lib 的公开 API
    eat_at_restaurant();
}
