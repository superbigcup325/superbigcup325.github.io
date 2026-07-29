fn return_a_string() -> &'static str {
    "hello world"
}

fn main() {
    let value = return_a_string();
    println!("{value}");
}
