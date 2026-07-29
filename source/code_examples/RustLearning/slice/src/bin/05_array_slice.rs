fn main() {
    let arr = [1, 2, 3, 4, 5];
    let slice = &arr[1..3];  // &[2, 3]
    println!("{slice:?}");

    for element in slice {
        println!("{element}");
    }
}
