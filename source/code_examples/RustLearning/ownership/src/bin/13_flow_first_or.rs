fn first_or<'a>(strings: &'a Vec<String>, default: &'a String) -> &'a String {
    if strings.len() > 0 {
        &strings[0]
    } else {
        default
    }
}

fn main() {
    let strings = vec![];
    let default = String::from("default");
    let s = first_or(&strings, &default);
    println!("{s}");
}
