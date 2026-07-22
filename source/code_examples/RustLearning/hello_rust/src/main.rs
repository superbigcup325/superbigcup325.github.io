use std::io::stdin; // prelude

fn main() {
    println!("please enter a word");
    let mut message = String::new();
    stdin().read_line(&mut message).expect("invalid input");
    // .expect("invalid input") 是错误处理的一种简化写法：
    // 如果 read_line 失败（例如标准输入已关闭），程序会立即终止并打印指定的错误信息
    
    println!("the message is {}", message);
}
