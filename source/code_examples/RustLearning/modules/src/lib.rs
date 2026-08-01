// 本文件是 library crate 的根（crate root）
// 一个 package 可以同时包含 src/main.rs（binary）和 src/lib.rs（library）
// mod 声明会查找同名文件：
//   mod front_of_house;  → 查找 src/front_of_house.rs

mod front_of_house;
mod back_of_house;
mod kitchen;

// pub use 重导出：外部代码可以通过 modules::hosting 访问
pub use crate::front_of_house::hosting;

// 公开 API：外部 crate 可以调用
pub fn eat_at_restaurant() {
    // 绝对路径：从 crate 根开始
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径：从当前模块开始
    front_of_house::hosting::add_to_waitlist();

    let mut meal = back_of_house::Breakfast::summer("Rye");
    meal.toast = String::from("Wheat");
    println!("I'd like {} toast please", meal.toast);

    let order1 = back_of_house::Appetizer::Soup;
    let order2 = back_of_house::Appetizer::Salad;
    let _ = (order1, order2);

    kitchen::fix_incorrect_order();
}

// 私有函数：只有本 crate 内可见
fn deliver_order() {}
