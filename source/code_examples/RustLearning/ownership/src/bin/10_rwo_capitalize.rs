fn ascii_capitalize(v: &mut Vec<char>) {
    let c = &v[0];
    if c.is_ascii_lowercase() {
        let up = c.to_ascii_uppercase();
        v[0] = up;
    } else {
        println!("{:?}", v);
    }
}

fn main() {
    let mut chars = vec!['h', 'e', 'l', 'l', 'o'];
    ascii_capitalize(&mut chars);
    println!("{:?}", chars);
}
