// kitchen 模块的内容

pub fn fix_incorrect_order() {
    cook_order();
    // super 指向父模块（crate 根），类似文件系统的 ..
    super::deliver_order();
}

fn cook_order() {}
