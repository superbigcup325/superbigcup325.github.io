fn early_return(x: i32) -> i32 {
    if x < 0 {
        return 0;  // 提前返回
    }
    x + 5          // 隐式返回
}

fn main() {
    println!("{}", early_return(-1)); // 0
    println!("{}", early_return(3));  // 8
}
