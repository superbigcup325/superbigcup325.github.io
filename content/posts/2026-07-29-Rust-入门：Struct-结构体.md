---
title: Rust 入门：Struct 结构体
date: 2026-07-29
tags:
  - Rust
  - 入门
categories:
  - RustLearning
description: 介绍 Rust 中的结构体（struct）——包括定义语法、内存布局、元组结构体、单元结构体、方法以及派生 trait
slug: rust-struct
series: Rust 入门
series_index: 4.1
chapter_name: 结构体与枚举
---
`structs` 示例覆盖了结构体的主要用法，下面按概念逐一说明

## Part 1 声明语法与内存分析

结构体使用 `struct` 关键字声明，采用 **PascalCase** 命名（各单词首字母大写）：

```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}
```

每个字段由 `name: type` 组成。结构体在内存中连续排列各个字段，但 `String` 类型的字段在栈上只存储指针和长度，实际字符串内容在堆上：

```
User 的栈内存布局（示意）：
+--------+-------------+-------------+---------------+
| active | username    | email       | sign_in_count |
| 1 byte | ptr + len   | ptr + len   | 8 bytes       |
|        | (24 bytes)  | (24 bytes)  |               |
+--------+-----|-------|-----|-------+---------------+
               |             |
               ↓             ↓
           堆上 "123"    堆上 "123@example.com"
```

结构体本身的字段在栈上连续排列，其中 `String` 字段占用 24 字节（8 字节指针 + 8 字节长度 + 8 字节容量），指向堆上实际的字符串内容。`bool` 和 `u64` 等标量类型则直接存储在栈上

### 1.1 创建与修改

```rust
let user = User {
    email: String::from("123@example.com"),
    username: String::from("123"),
    active: true,
    sign_in_count: 1,
};

let mut user1 = build_user(String::from("123@example.com"), String::from("123"));
user1.email = String::from("345@example.com");
```

字段简写：当变量名与字段名相同时，可以省略字段名：

```rust
fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}
```

### 1.2 结构体更新语法

```rust
let user2 = User {
    email: String::from("another@example.com"),
    ..user1  // 其余字段从 user1 复制
};
```

`..user1` 将 `user1` 中未显式赋值的字段移动到 `user2`。此时 `user1` 中 `String` 类型字段的所有权被转移，`user1` 整体不再可用。该行为取决于字段类型是否实现了 `Copy` trait（后文 [#所有权在方法中的体现](#所有权在方法中的体现) 有类似例子）：`String` 没有实现 `Copy`，因此所有权被转移；如果所有字段都实现了 `Copy`，则 `..user1` 等价于复制

## Part 2 元组结构体（Tuple Struct）

元组结构体有字段名，只有类型：

```rust
struct Color(i32, i32, i32);

let color = Color(255, 0, 0);
```

适用于需要区分相同底层类型的不同含义的场景，比如 `Color` 和 `Point` 即使内部类型相同也是不同的类型

## Part 3 单元结构体（Unit-like Struct）

不包含任何字段的结构体：

```rust
struct AlwaysEqual;

let subject = AlwaysEqual;
```

常用于实现 trait，不需要存储任何数据时使用

## Part 4 方法

方法在 `impl` 块中定义，第一个参数始终是 `self`（或 `&self`、`&mut self`）：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    println!("area: {}", rect1.area());
}
```

| 形式        | 所有权     | 适用场景         |
| ----------- | ---------- | ---------------- |
| `self`      | 获取所有权 | 方法需要消费实例 |
| `&self`     | 不可变借用 | 只读访问字段     |
| `&mut self` | 可变借用   | 需要修改实例     |

### 4.1 关联函数（Associated Function）

在 `impl` 块中定义、但不接收 `self` 参数的函数称为关联函数，使用 `::` 语法调用：

```rust
impl Rectangle {
    fn square(size: u32) -> Rectangle {
        Rectangle { width: size, height: size }
    }
}

let square = Rectangle::square(3);
```

`Rectangle::square` 类似于其他语言中的静态方法

## Part 5 派生 Trait

使用 `#[derive(...)]` 可以让编译器自动实现某些 trait：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}
```

`#[derive(Debug)]` 允许使用 `{:?}` 或 `{:#?}` 格式化输出结构体内容：

```rust
println!("rect1 is {rect1:#?}");
```

```text
rect1 is Rectangle {
    width: 30,
    height: 50,
}
```

常用派生 trait 包括 `Debug`、`Clone`、`Copy`、`PartialEq` 等

## Part 6 所有权在方法中的体现

方法中的 `self` 参数同样遵循所有权规则：

```rust
#[derive(Copy, Clone)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn max(self, other: Rectangle) -> Rectangle {
        let w = self.width.max(other.width);
        let h = self.height.max(other.height);
        Rectangle { width: w, height: h }
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    let rect2 = Rectangle { width: 10, height: 40 };
    let rect_max = Rectangle::max(rect1, rect2);
    // println!("{}", rect1.area());  // error: rect1 已被移动
}
```

这里 `Rectangle` 实现了 `Copy` 和 `Clone`，因此赋值时复制而非移动。如果没有 `Copy`，`max(rect1, rect2)` 会将所有权转移进函数

## 小结

| 概念        | 一句话                                      |
| ----------- | ------------------------------------------- |
| `struct`    | 自定义数据结构，包含多个命名字段            |
| 字段简写    | 变量名与字段名相同时可省略字段名            |
| 更新语法    | `..instance` 复制其余字段                   |
| 元组结构体  | `struct Name(T1, T2)`，按位置访问字段       |
| 单元结构体  | `struct Name;`，无字段，常用于实现 trait    |
| `impl`      | 定义方法与关联函数                          |
| `&self`     | 只读方法，不获取所有权                      |
| `&mut self` | 修改实例的方法                              |
| 关联函数    | 不接收 `self`，用 `::` 调用                 |
| `#[derive]` | 自动实现 trait，如 `Debug`、`Copy`、`Clone` |
