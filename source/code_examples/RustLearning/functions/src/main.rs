fn main() {
    hello_world();

    let result = {
        let x = 1; // 语句（statement）(以分号结尾)，无返回值
        x + 1           // 表达式(expression)，值作为返回值
    };
    println!("the result is: {}", result);

    let val = plus_five(result);
    println!("the value is: {}", val);
}

// 函数名必须使用 snake_case 风格
fn hello_world() {
    println!("hello world");
}

fn plus_five(x: i32) -> i32 {
    x + 5 // 隐式返回
    // 等效 return x + 5;
}
