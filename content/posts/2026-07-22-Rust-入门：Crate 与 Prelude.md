---
title: Rust 入门：Crate 与 Prelude
date: 2026-07-21
tags:
  - Rust
  - 入门
categories:
  - RustLearning
description: 以一段简单的 Rust 代码为例，介绍 crate 的基本概念（二进制与库的区别）以及 prelude 自动导入机制
slug: rust-crate-prelude
series: Rust 入门
series_index: 1.2
chapter_name: 环境与基础概念
---
## Part 1 示例代码

`hello_rust`

```rust
use std::io::stdin;

fn main() {
    println!("please enter a word");
    let mut message = String::new();
    stdin().read_line(&mut message).expect("invalid input");
    // .expect("invalid input") 是错误处理的一种简化写法：
    // 如果 read_line 失败（例如标准输入已关闭），程序会立即终止并打印指定的错误信息

    println!("the message is {}", message);
}
```

功能是读取一行内容并打印，涉及两个 Rust 的基础概念：**crate** 和 **prelude**，下面逐一说明

## Part 2 Crate：代码的组织单元
> 注：crate 一词在 Rust 中没有标准中文译名，可以理解为“代码包”或“编译单元”

Rust 中，一个 **crate** 就是一棵模块树，也就是一次编译的最小单位

cargo new 创建的是一个 package（包）。一个 package 可以包含一个或多个 crate（代码单元

默认情况下：

- cargo new hello_rust 创建一个只包含单个二进制 crate 的 package，其根文件是 src/main.rs
- cargo new my_lib --lib 创建一个只包含单个库 crate 的 package，其根文件是 src/lib.rs

一个 package 也可以同时包含二进制和库 crate，但入门阶段先把“一个 package ≈ 一个 crate”作为初步理解即可

Rust 区分两种 crate 形态，关键看项目 `src/` 下的根文件：

### 2.1 二进制 crate（binary）

入口文件是 `main.rs`，必须包含一个 `fn main()` 函数作为程序入口

```bash
cargo new hello_rust
```

生成的结构如下：

```
hello_rust/
├── Cargo.toml
└── src/
    └── main.rs        # crate root，程序从这里开始
```

编译后得到一个可执行文件，可以直接运行

### 2.2 库 crate（library）

入口文件是 `lib.rs`，没有 `main` 函数，其作用是提供可被其他 crate 调用的函数、类型和模块

```bash
cargo new my_lib --lib
```

生成的结构：

```
my_lib/
├── Cargo.toml
└── src/
    └── lib.rs         # crate root，对外暴露 API
```

库 crate 不产生可执行文件，而是编译为一个 `.rlib` 文件供其他 crate 引用。像 `rand`、`serde` 这类你通过 `cargo add` 引入的依赖，本质上都是库 crate

一个 package 可以同时包含一个二进制 crate 和一个库 crate，也可以在 `src/bin/` 下放置多个 `main.rs` 来包含多个二进制 crate

入门阶段，记住「`main.rs` 是可运行程序，`lib.rs` 是给别人用的库」就足够了

> 补充：关于 crate 的内部结构（模块树）、package 规则、路径与可见性的完整讲解，参见 [《Rust 入门：项目代码组织》](<2026-08-01-Rust-入门：项目代码组织.md>)

## Part 3 Prelude：不用写 `use` 就能用的那些东西

再看开头的代码第一行：

```rust
use std::io::stdin;
```

是因为 `stdin` 不在 Prelude 默认范围内，需要显式引入

Prelude 是标准库提供的预导入模块，可以近似理解为：编译器会在每个 crate 的根模块顶部自动导入 `std::prelude::v1` 中的内容，让我们能够直接使用其中的常用类型和 trait ，让我们能够直接使用其中的内容
> 补充：trait 在后续的学习中会接触到

打开 Rust 标准库文档中的 [`std::prelude`](https://doc.rust-lang.org/std/prelude/index.html) 页面，可以看到被自动导入的完整列表，包括但不限于以下内容：

- `Option::Some` / `Option::None`
- `Result::Ok` / `Result::Err`
- `String`、`Vec`
- `Copy`、`Clone`、`Drop` 等核心 trait
- `From`、`Into`、`TryInto` 等转换 trait

prelude 避免了我们在每份代码开头写一长串 `use std::...`，日常开发中大多数常用类型和宏都能直接使用

而 `std::io::stdin` 不在此列，所以必须手动导入。当你写 `use` 语句时，实际就是在把需要使用的功能引入当前作用域

自 2018 Edition 起，对于绝大多数外部 crate，你不再需要写 extern crate rand;。只要在 Cargo.toml 中声明了依赖，代码中直接 use rand::Rng; 即可。只有在极少数特殊场景下才需要显式写 extern crate，例如：

- 需要使用 #[macro_use] 导入某些老式宏（但大多数现代 crate 已用 use 方式导出宏）
- 需要显式指定 crate 的别名（如 extern crate foo as bar;）

**初学者可以认为「基本不需要写它」**

> 补充：`use` 的更多用法（嵌套路径、`as` 别名、`pub use` 重导出）参见 [《Rust 入门：项目代码组织》](<2026-08-01-Rust-入门：项目代码组织.md>)

## 小结

| 概念         | 一句话                                              |
| ------------ | --------------------------------------------------- |
| 二进制 crate | `main.rs` 为入口，有 `main` 函数，编译为可执行文件  |
| 库 crate     | `lib.rs` 为入口，无 `main`，编译为库供他人引用      |
| prelude      | 编译器自动导入的常用名称集合，省去手动 `use` 的麻烦 |
