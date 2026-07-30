fn main() {
    fn plush_one(x: Option<i32>) -> Option<i32> {
        match x {
            None => None,
            Some(i) => Some(i + 1),
        }
    }

    let five = Some(5);
    let six = plush_one(five);
    let none = plush_one(None);
}