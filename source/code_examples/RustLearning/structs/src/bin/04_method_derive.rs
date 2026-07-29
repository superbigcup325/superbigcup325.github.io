#[derive(Debug)]
struct Rectangle {
     width: u32,
     height: u32,
}

impl Rectangle {
    // &self 表示方法的调用者是一个不可变引用
    // &self -> self: &Self
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }

    // 关联函数
    fn square(size: u32) -> Rectangle {
        Rectangle {
            width: size,
            height: size,
        }
    }
}

fn main() {
    let square = Rectangle::square(3);

    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    let rect2 = Rectangle {
        width: 10,
        height: 40,
    };

    println!("rect1 is {rect1:#?}");
    println!("The area of the rectangle is {} square pixels.", rect1.area());
    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
    println!("Can rect2 hold rect1? {}", Rectangle::can_hold(&rect2, &rect1));
}