fn main() {
    let number = 7;

    if number < 5 {
        println!("小于 5");
    } else if number < 10 {
        println!("大于等于 5，小于 10");
    } else {
        println!("大于等于 10");
    }

    // if 作为表达式
    let result = if number > 5 { "big" } else { "small" };
    println!("{result}");
}
