// back_of_house 模块的内容

// struct 的字段默认私有，可以逐字段设为 pub
pub struct Breakfast {
    pub toast: String,
    seasonal_fruit: String,
}

impl Breakfast {
    // 因为有私有字段，必须提供公开构造函数
    pub fn summer(toast: &str) -> Breakfast {
        Breakfast {
            toast: String::from(toast),
            seasonal_fruit: String::from("peaches"),
        }
    }
}

// enum 设为 pub 后，所有变体自动公开
pub enum Appetizer {
    Soup,
    Salad,
}
