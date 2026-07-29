fn return_a_string(output: &mut String) {
    output.replace_range(.., "hello world");
}

fn main() {
    let mut name = String::new();
    return_a_string(&mut name);
    println!("{name}");
}
