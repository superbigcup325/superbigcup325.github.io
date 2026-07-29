fn main() {
    let mut v = vec![1, 2, 3, 4, 5];
    let num = &mut v[2];
    *num += 1;
    println!("{}", *num);
    println!("{:?}", v);
}
