// 可见性：struct 字段的 pub 与私有
mod back_of_house {
    // toast 公开，seasonal_fruit 私有
    pub struct Breakfast {
        pub toast: String,
        seasonal_fruit: String,
    }

    impl Breakfast {
        // 因为存在私有字段，外部必须通过构造函数创建实例
        pub fn summer(toast: &str) -> Breakfast {
            Breakfast {
                toast: String::from(toast),
                seasonal_fruit: String::from("peaches"),
            }
        }
    }

    // enum 公开后，所有变体自动公开
    pub enum Appetizer {
        Soup,
        Salad,
    }
}

fn main() {
    let mut meal = back_of_house::Breakfast::summer("Rye");
    meal.toast = String::from("Wheat"); // 公开字段可读可写
    println!("I'd like {} toast please", meal.toast);

    // 私有字段无法访问：
    // meal.seasonal_fruit = String::from("blueberries");  // 编译错误

    let order1 = back_of_house::Appetizer::Soup;
    let order2 = back_of_house::Appetizer::Salad;
    let _ = (order1, order2);
}
