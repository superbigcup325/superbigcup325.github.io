use std::rc::Rc;

fn return_a_string() -> Rc<String> {
    let s = Rc::new(String::from("hello world"));
    Rc::clone(&s)
}

fn main() {
    let value = return_a_string();
    println!("{value}");
}
