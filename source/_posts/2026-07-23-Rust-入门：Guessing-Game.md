---
title: Rust 入门：Guessing Game
date: 2026-07-23
tags:
  - Rust
  - 入门
categories:
  - RustLearning
description: 通过一个猜数字游戏，介绍 cargo add 添加依赖、trait、范围表达式、match 表达式和变量遮蔽等 Rust 核心概念
---

## 示例代码

`guessing_game`

```rust
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
        
        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("not a number");
                continue;
            },
        };

        println!("the number you guess is {}", guess);

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
```

程序会生成一个 1 到 100 之间的随机数，然后不断让用户猜，每次会提示「太大」或「太小」，猜中后退出。虽然只有三十多行，但它串联了 Rust 中几个重要的概念，下面按代码顺序逐一说明

## 添加依赖：cargo add

程序依赖一个外部 crate——`rand`，用于生成随机数。在 `Cargo.toml` 中可以看到：

```toml
[dependencies]
rand = "0.8.5"
```

这里我们手动写入了依赖，但更推荐的做法是使用 cargo 命令来添加：

```bash
cargo add rand
```

一条命令就能完成下载、写入 `Cargo.toml`、更新 `Cargo.lock` 三个步骤，还避免了手写版本号时的格式错误。如需指定版本号，在 crate 名后加 `@` 即可：

```bash
cargo add rand@0.8.5
```

等价于在 `Cargo.toml` 中写入 `rand = "0.8.5"`。不指定版本时，cargo 会自动添加兼容的最新版

`cargo add` 也可以同时指定多个依赖或启用 features：

```bash
cargo add serde --features derive
```

>> 关于 `Cargo.toml` 与 `Cargo.lock` 的具体说明，参见本系列第一篇文章

>> 关于 package、crate 与依赖的完整梳理，参见 [《Rust 入门：项目代码组织》](2026-08-01-Rust-入门：项目代码组织.md)

## 开头的三行 use

```rust
use std::io;
use std::cmp::Ordering;
use rand::Rng;
```

这三行将需要用到的名称引入当前作用域：

- `std::io` 提供输入输出功能（如 `stdin()`）
- `std::cmp::Ordering` 是一个枚举，包含 `Less`、`Greater`、`Equal` 三个变体，供后续比较结果使用
- `rand::Rng` 是一个 **trait**（特征），定义了随机数生成器需要实现的方法

>> `use` 的完整用法（嵌套路径、别名、重导出）参见 [《Rust 入门：项目代码组织》](2026-08-01-Rust-入门：项目代码组织.md)

### Trait：行为的抽象

trait 可以理解为其他语言中的接口（interface），它定义了一组方法签名，让不同类型可以实现相同的行为

`rand::Rng` 这个 trait 定义了 `gen_range` 等方法。`rand::thread_rng()` 返回的具体类型实现了 `Rng` trait，因此才能调用 `gen_range`

可以这样理解：trait 约定了「能做什么」，具体类型通过 `impl ... for ...` 来实现 trait，从而提供具体的行为

>> trait 是 Rust 中极其重要的概念，后续还会反复遇到，包括 `Clone`、`Copy`、`Drop` 等标准库中的核心 trait

## 范围表达式

```rust
rand::thread_rng().gen_range(1..101)
```

`1..101` 是一个**范围表达式**（range expression），使用 `..` 语法表示一个**半开区间**（左闭右开），即 `1 <= x < 101`，生成的数字范围是 1 到 100

Rust 提供两种范围写法：

| 写法 | 含义 | 示例 |
| --- | --- | --- |
| `start..end` | 左闭右开，不含 `end` | `1..5` → 1, 2, 3, 4 |
| `start..=end` | 全闭区间，含 `end` | `1..=5` → 1, 2, 3, 4, 5 |

回到原本的代码：`1..101` 也可以写成 `1..=100`，效果一样

范围表达式不只用于 `gen_range`，在 `for` 循环中也很常见：

```rust
for i in 0..3 {
    println!("{}", i);  // 输出 0, 1, 2
}
```

## 变量遮蔽（Shadowing）

```rust
let mut guess = String::new();
// ... 读取输入 ...
let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => {
        println!("not a number");
        continue;
    },
};
```

这里的第二个 `let guess` 用 `u32` 类型的数字**遮蔽**（shadow）了之前 `String` 类型的 `guess`。这是 Rust 的**变量遮蔽**（shadowing）特性，具备以下特点：

- 后续代码只能访问新变量，旧变量（`String` 类型）不复存在
- 可以改变变量的类型：`String` → `u32`
- 可以改变可变性：`let mut guess` → `let guess`（变为不可变）

如果不用 shadowing，就需要为转换后的值另起一个名字，比如 `let guess_num: u32 = ...`。shadowing 让我们能复用同一个名字，逻辑上更清晰

>> shadowing 与 `mut` 不同：`mut` 允许修改同类型变量的值但不能改变类型；shadowing 则创建一个全新的变量，可以改变类型

## match 表达式

match 是 Rust 中用于**模式匹配**的控制流结构，上面的代码中出现了两次

### 搭配 Result 处理解析结果

```rust
match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => {
        println!("not a number");
        continue;
    },
}
```

`guess.trim().parse()` 返回一个 `Result<u32, ParseIntError>` 枚举。`Result` 有两个变体：

- `Ok(value)` —— 解析成功，取出里面的数字
- `Err(error)` —— 解析失败，打印提示并用 `continue` 重新开始循环

>> `_` 是通配符模式，匹配任何值但忽略其内容。这里我们不关心具体的错误类型，所以用 `_` 忽略

### 搭配 Ordering 处理比较结果

```rust
match guess.cmp(&secret_number) {
    Ordering::Equal => {
        println!("you win");
        break;
    },
    Ordering::Less => println!("too small"),
    Ordering::Greater => println!("too big"),
}
```

`cmp` 方法返回 `Ordering` 枚举的三个变体之一，match 对每种情况分别处理：

- `Equal`：猜中了，打印胜利信息并用 `break` 退出循环
- `Less`：猜小了
- `Greater`：猜大了

match 的一个关键特性是**穷尽性**（exhaustiveness）：编译器会强制检查所有可能的分支是否都被覆盖，如果遗漏了某个分支，代码将无法通过编译。这从根本上避免了忘记处理某种情况的隐患

## 小结

| 概念 | 一句话 |
| --- | --- |
| `cargo add` | 命令行添加依赖，自动写入 `Cargo.toml` 并更新 `Cargo.lock` |
| trait | 定义方法签名的抽象接口，类型通过实现 trait 来提供具体行为 |
| 范围表达式 | `start..end` 表示半开区间，`start..=end` 表示闭合区间 |
| shadowing | 用 `let` 重新声明同名变量，可改变类型和可变性，旧变量被遮蔽 |
| match | 穷尽匹配的模式控制流，必须覆盖所有可能的分支 |
