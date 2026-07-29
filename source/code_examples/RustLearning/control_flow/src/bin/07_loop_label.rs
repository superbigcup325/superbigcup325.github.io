fn main() {
    let mut count = 0;
    'counting_up: loop {
        println!("count = {count}");
        let mut remaining = 10;

        loop {
            println!("remaining = {remaining}");
            if remaining == 9 {
                break;               // 只 break 内层循环
            }
            if count == 2 {
                break 'counting_up;  // break 外层循环
            }
            remaining -= 1;
        }
        count += 1;
    }
    println!("count result = {count}");
}
