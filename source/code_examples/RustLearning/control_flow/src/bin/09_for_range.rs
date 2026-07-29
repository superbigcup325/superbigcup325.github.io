fn main() {
    let arr = [10, 20, 30, 40, 50];
    for element in arr {
        println!("the value is: {element}");
    }

    println!("---");

    for number in 1..4 {
        println!("{number}");  // 1, 2, 3
    }

    println!("---");

    for number in 1..=4 {
        println!("{number}");  // 1, 2, 3, 4
    }
}
