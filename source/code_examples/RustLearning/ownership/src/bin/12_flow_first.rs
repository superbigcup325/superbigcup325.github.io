fn first(strings: &Vec<String>) -> &String {
    let s_ref = &strings[0];
    s_ref
}

fn main() {
    let strings = vec![String::from("hello"), String::from("world")];
    let s = first(&strings);
    println!("{s}");
}
