---
title: Rust 入门：Slice 切片
date: 2026-07-29
tags:
  - Rust
  - 入门
categories:
  - RustLearning
description: 介绍 Rust 中的切片（Slice）类型——包括字符串切片、胖指针、字符串字面值的本质，以及其他类型的切片
---

`slice` 示例展示了切片的基本用法，下面按代码顺序逐一说明

## String Slice

**切片**（slice）是对集合中一段连续元素的引用。字符串切片（`&str`）表示对 `String` 或字符串字面值中某一部分的借用：

```rust
let s = String::from("Hello world!");
let hello = &s[0..5];   // "Hello"
let world = &s[6..11];  // "world"
```

范围语法 `&s[start..end]` 是左闭右开区间，包含 `start`，不包含 `end`。也可以简写：

| 写法 | 含义 |
| --- | --- |
| `&s[0..5]` | 从 0 到 5（不含 5） |
| `&s[..5]` | 从开头到 5（不含 5） |
| `&s[6..]` | 从 6 到末尾 |
| `&s[..]` | 整个字符串 |

### 胖指针（Fat Pointer）

切片在内部是一个**胖指针**（fat pointer），包含两个值：指向数据的指针和切片的长度

```
s 的内部布局：
+----------+----------+
| 指针     | 长度      |
| → "H..." | 12       |
+----------+----------+

&s[0..5] 的内部布局：
+----------+----------+
| 指针     | 长度      |
| → "H..." | 5        |
+----------+----------+
```

与之对比，普通的 `&T` 引用只有一个指针，而切片的胖指针需要额外记录长度信息

### 示例函数

```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}
```

这个函数的参数类型是 `&str`，而不是 `&String`。由于 Rust 的**隐式转换**（deref coercion），`&String` 可以自动转换为 `&str`，因此两种方式都能调用：

```rust
let s = String::from("hello world");
let word = first_word(&s);       // &String → &str，隐式转换

let word = first_word("hello");  // &str，直接传入
```

### 切片与可变引用的冲突

```rust
let mut s = String::from("Hello world!");
let word = first_word(&s);   // word 是 s 的切片引用
s.clear();                   // 编译错误：s 被借用，无法修改
```

`word` 持有 `s` 的不可变引用（切片），使 `s` 失去 W 权限。`clear()` 需要修改 `s`，如果此处 `clear()` 执行，`word` 就会指向已释放的内存

## 字符串字面值是切片

```rust
let s = "Hello world!";
```

字符串字面值的类型是 `&str`——它是一个指向程序二进制文件中特定位置的切片。这也是为什么字符串字面值是不可变的：`&str` 是一个不可变引用，无法修改它指向的内容

## 其他类型的切片

切片不限于字符串。任何连续的集合都可以创建切片：

```rust
let arr = [1, 2, 3, 4, 5];
let slice = &arr[1..3];  // &[2, 3]，类型为 &[i32]
```

## 小结

| 概念 | 一句话 |
| --- | --- |
| 切片（Slice） | 对集合中一段连续元素的引用，包含指针和长度 |
| `&str` | 字符串切片，指向 `String` 或字面值的一部分 |
| `&[T]` | 任意类型 `T` 的切片，如 `&[i32]` |
| 胖指针 | 切片内部包含指针 + 长度两个值 |
| deref coercion | `&String` 自动转换为 `&str`，参数声明 `&str` 更通用 |
| 字符串字面值 | 类型为 `&str`，指向程序二进制文件中的数据 |
