fn smallest<T: PartialOrd>(list: &[T]) -> &T {
    let mut smallest = &list[0];

    for item in list {
        if item < smallest {
            smallest = item;
        }
    }

    smallest
}

fn main() {
    let numbers = vec![7, 2, 9, 1, 8];
    let letters = vec!['c', 'a', 'd', 'b'];

    println!("smallest number: {}", smallest(&numbers));
    println!("smallest char: {}", smallest(&letters));

    let integer = Some(5);
    let float = Some(5.0);
    println!("integer: {integer:?}, float: {float:?}");
}
