---
title: Rust 入门：Enum 与 Match
date: 2026-07-30
tags:
  - Rust
  - 入门
categories:
  - RustLearning
description: 介绍 Rust 中的枚举（enum）、模式匹配（match）以及 Option 类型
---

`enums_and_match` 示例覆盖了枚举与模式匹配的主要用法，下面按概念逐一说明

## Enum 语法

枚举使用 `enum` 关键字声明，变体名采用 **PascalCase** 命名：

```rust
enum IpAddrKind {
    V4,
    V6,
}

let four = IpAddrKind::V4;
let six = IpAddrKind::V6;

route(four);
route(six);
```

> C++ 中的 `enum class` 类似，但 Rust 的枚举变体是独立的命名空间，通过 `IpAddrKind::V4` 访问

## Enum 携带数据

同时，枚举变体可以携带不同类型的数据，比 struct 更灵活且方便：

```rust
enum Message {
    Quit,                       // 无数据
    Move { x: i32, y: i32 },    // 命名字段（类似 struct）
    Write(String),              // 元组风格
    ChangeColor(i32, i32, i32), // 元组风格
}
```

相比之下，等价的 struct 写法需要定义多个类型：

```rust
struct QuitMessage;
struct MoveMessage { x: i32, y: i32 }
struct WriteMessage(String);
struct ChangeColorMessage(i32, i32, i32);
```

一个枚举能在一个类型里组合所有变体，而 struct 需要定义多个类型

变体还可以携带实际数据，类似 struct + enum 的组合：

```rust
enum IpAddrKind {
    V4(u8, u8, u8, u8),
    V6(String),
}

struct IpAddr {
    kind: IpAddrKind,
    address: String,
}

let home = IpAddr {
    kind: IpAddrKind::V4(127, 0, 0, 1),
    address: String::from("localhost"),
};
```

## Enum方法

Enum可以像 struct 一样用 `impl` 定义方法：

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

impl Message {
    fn call(&self) {
        // 方法体
    }
}
```

## Match 基本用法

`match` 表达式将一个值与模式逐一比较。值得注意的是，表达式**必须穷尽所有可能**：

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

> `match` 的每个分支用 `=>` 分隔，表达式用 `{}` 包裹（单行可省略）

### 穷尽性

match 必须覆盖所有可能的变体，否则编译报错：

```rust
match coin {
    Coin::Penny => 1,
    Coin::Nickel => 5,
    // 编译错误：Dime 和 Quarter 未覆盖
}
```

## 更多匹配写法

### 解构嵌套数据

match 可以解构嵌套的枚举数据：

```rust
#[derive(Debug, Clone, Copy)]
enum UsState { Alabama, Alaska }

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {:?}!", state);
            25
        },
    }
}
```

`Quarter(state)` 将内部的 `UsState` 绑定到变量 `state`，可在分支体中使用

### 匹配字面量

match 可以直接匹配具体的值。当我们只需要处理个别情况时，可以这么写：

```rust
let dice_roll: u8 = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    other => move_player(other),
}
```

### 多行分支

分支体是块表达式时，和函数返回内容的方式一样：

```rust
let result = match coin {
    Coin::Penny => {
        println!("Lucky penny!");
        1
    },
    Coin::Nickel => 5,
    _ => 0,
};
```

## 捕获

match 的每个分支都可以捕获匹配的值，用变量名替代 `_`：

```rust
let dice_roll: u8 = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    other => move_player(other),  // other 捕获其他所有值
}
```

用 `_` 则忽略捕获的值：`_ => ()`

## RWO 与借用

match 同样遵循 RWO 权限系统，可以按借用方式匹配：

```rust
let message = Message::Write(String::from("hello"));

// 不可变借用
match &message {
    Message::Quit => println!("Quit"),
    Message::Move { x, y } => println!("Move to {x}, {y}"),
    Message::Write(text) => println!("Text: {text}"),
    Message::ChangeColor(r, g, b) => println!("Color: {r}, {g}, {b}"),
}
// message 仍可用
```

```rust
let message = Message::Write(String::from("hello"));

// 获取所有权
match message {
    Message::Quit => println!("Quit"),
    Message::Write(text) => {
        println!("Text: {text}");
        // text 获取了所有权
    },
    _ => (),
}
// message 已被移动
```

> 与函数传参类似：`match &message` 是借用，`match message` 是移动

## Option 与 Match

`Option<T>` 是 Rust 的可选值类型，用于表示"可能有值，也可能没有"，即数据可能为 `None` 或 `T`：

```rust
enum Option<T> {
    Some(T),
    None,
}
```

直接将 `Option<i32>` 与整数运算会报错：

```rust
let x: i32 = 5;
let y: Option<i32> = Some(2);
// x += y;  // 错误：Option<i32> 不能直接与整数相加
```

> Rust 没有 null，Option 是更安全的替代

match 是处理 Option 的标准方式：

```rust
fn plush_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plush_one(five);
let none = plush_one(None);
```

## If Let 语法

当 match 只需要处理一种情况时，我们可以使用 `if let` ：

```rust
let config_max = Some(3u8);

if let Some(max) = config_max {
    println!("the maximum number is {max}");
} else {
    println!("None");
}
```

等价的 match 写法：

```rust
match config_max {
    Some(max) => println!("the maximum number is {max}"),
    _ => (),
}
```

## 小结

| 概念 | 一句话 |
| --- | --- |
| `enum` | 枚举类型，变体可携带不同类型的数据 |
| 变体 | 枚举的可能状态，通过 `Type::Variant` 访问 |
| `impl` | 枚举可以定义方法，与 struct 一致 |
| `match` | 模式匹配，必须穷尽所有可能 |
| 解构绑定 | 用 `Variant(data)` 捕获枚举内部数据 |
| `_` 通配符 | 匹配剩余所有情况 |
| `Option<T>` | `Some(T)` 或 `None`，替代 null |
| `if let` | 只关心一个模式时的简洁写法 |
| `&` 借用 | `match &value` 不获取所有权 |
