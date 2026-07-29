#[derive(Copy, Clone)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn max(self, other: Rectangle) -> Rectangle {
        let w = self.width.max(other.width);
        let h = self.height.max(other.height);
        Rectangle { width: w, height: h }
    }

    fn set_to_max(&mut self, other: &Rectangle) {
        *self = self.max(*other);
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    let rect2 = Rectangle {
        width: 10,
        height: 40,
    };

    let rect_max = Rectangle::max(rect1, rect2);
    // println!("", rect1.area());
    // error!
}