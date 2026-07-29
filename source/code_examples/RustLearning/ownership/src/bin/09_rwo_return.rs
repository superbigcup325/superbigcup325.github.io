fn main() {
    let mut x = 1;
    let y = &x;
    let z = *y;
    x += z;
    println!("{x}");
}
