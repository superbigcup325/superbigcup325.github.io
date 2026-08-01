// 路径：绝对路径与相对路径
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

fn deliver_order() {}

mod back_of_house {
    // super 指向父模块（此处为 crate 根），类似文件系统的 ..
    pub fn fix_incorrect_order() {
        cook_order();
        super::deliver_order();
    }

    fn cook_order() {}
}

fn eat_at_restaurant() {
    // 绝对路径：从 crate 根开始
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径：从当前模块开始
    front_of_house::hosting::add_to_waitlist();

    back_of_house::fix_incorrect_order();
}

fn main() {
    eat_at_restaurant();
}
