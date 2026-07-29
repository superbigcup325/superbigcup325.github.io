fn return_a_string() -> String {
    let s = String::from("hello world");
    s
}

fn main() {
    let value = return_a_string();
    println!("{value}");
}
