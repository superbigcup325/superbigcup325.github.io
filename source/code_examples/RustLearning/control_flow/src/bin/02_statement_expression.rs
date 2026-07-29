fn main() {
    let result = {
        let x = 1;   // 语句，不返回值
        x + 1          // 表达式，值为 2
    };
    println!("{result}"); // 2
}
