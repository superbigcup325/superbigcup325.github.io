use std::io;
use std::cmp::Ordering;
use rand::Rng;

fn main() {
    println!("guessing game");

    let secret_number = rand::thread_rng().gen_range(1..101);
    
    loop {
        println!("guess a number");

        let mut guess = String::new();
        io::stdin().read_line(&mut guess).expect("please type a number");
        
        // 使用变量遮蔽（Shadowing）将 String 类型的 guess 转换为 u32 类型
        // 原 guess（String）在此处被遮蔽，后续无法再访问
        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("not a number");
                continue;
            },
        };

        println!("the number you guess is {}", guess);

        // match语句
        match guess.cmp(&secret_number) {
            Ordering::Equal => {
                println!("you win");
                break;
            },
            Ordering::Less => println!("too small"),
            Ordering::Greater => println!("too big"),
        }
    }
}
