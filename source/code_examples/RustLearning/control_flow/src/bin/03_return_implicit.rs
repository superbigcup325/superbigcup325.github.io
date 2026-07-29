fn plus_five(x: i32) -> i32 {
    x + 5  // 隐式返回，等效于 return x + 5;
}

fn main() {
    let val = plus_five(3);
    println!("{val}"); // 8
}
