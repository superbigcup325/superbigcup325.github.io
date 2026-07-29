fn add_suffix(name: &mut String) {
    name.push_str(" Jr.");
}

fn main() {
    let mut name = String::from("Alice");
    add_suffix(&mut name);
    println!("{name}");
}
