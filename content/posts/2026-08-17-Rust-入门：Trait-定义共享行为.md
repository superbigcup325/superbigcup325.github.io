---
title: Rust 入门：Trait-定义共享行为
date: 2026-08-17
tags:
  - Rust
  - 入门
categories:
  - RustLearning
description: 用 trait 为不同类型定义共享行为：定义与实现语法、一致性（孤儿规则）、默认实现、impl Trait 参数与 trait bound、where 子句、impl Trait 返回值、条件实现方法与 blanket 实现
slug: rust-traits
series: Rust 入门
series_index: 5.5
chapter_name: 综合应用
---
`generics` 示例解决了「概念的重复」，保证同样的逻辑在不同类型上跑。泛型本身在使用时有个前提：类型必须**具备某种能力**（比如 `largest` 要求 `T: PartialOrd` 才能用 `>` 比较）。而这个「能力」就是 **trait（特征）**

## Part 1 trait 是什么：定义共享行为

> 笔者注：trait 可以近似理解为「接口」。

trait 定义某个类型具有、并能与其他类型**共享**的功能。我们可以用 trait 以抽象的方式**定义共享行为**；再用 trait bound 指定「泛型类型可以是任何具备某种行为的类型」

直觉上这很像其他语言里的**接口（interface）**，但 Rust 的 trait 实际上存在一些区别，比如不能直接在 trait 里放字段数据、不能「继承」已有实现等，后面会陆续看到。先记住：**接口是「类型必须提供什么方法」的契约，trait 也是**

### 1.1 行为 = 可以调用的方法

一个类型的「行为」就是我们可以对该类型调用的方法。如果不同类型的实例上能调用**同样的方法**，它们就共享同样的行为。trait 定义就是把一组方法签名聚到一起，定义一个完成某个目的所需的行为集合

比如要做一个媒体聚合器：多个 struct 持有各种文本，如`NewsArticle` 存一篇带地点、作者、正文的新闻稿，`SocialPost` 是的社交帖子（附带 `reply`、`repost` 标记）。聚合器要展示每种数据的摘要，也就是要求每个类型都能调 `summarize` 方法。trait 就是表达这种要求的工具

## Part 2 定义与实现 trait

### 2.1 定义语法

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
```

- 用 `trait` 关键字 + trait 名（`Summary`），命名遵守 UpperCamelCase
- 声明成 `pub`，这样依赖本 crate 的其他 crate 也能使用
- 大括号里列方法签名：**签名以分号结尾，不给函数体**。每个实现该 trait 的类型必须自己提供方法体
- 一个 trait 可以有多个方法，一行一个签名，每行以分号结尾

### 2.2 实现语法

```rust
pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct SocialPost {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub repost: bool,
}

impl Summary for SocialPost {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

实现 trait 和实现普通方法（`impl` 块）很像，区别在于：`impl` 后先写 trait 名，再用 `for` 关键字接类型名。`impl` 块内的方法签名要和 trait 定义**完全一致**，只是把声明换成实际的函数。编译器会强制检查：声称实现了 `Summary` 的类型必须有签名精确匹配的 `summarize`

### 2.3 使用 trait 要先把它带入作用域

```rust
use aggregator::{SocialPost, Summary};

fn main() {
    let post = SocialPost {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        repost: false,
    };

    println!("1 new post: {}", post.summarize());
    // 1 new post: horse_ebooks: of course, as you probably already know, people
}
```
注意：除了把类型带入作用域，**还得把 trait 也 `use` 进来**，才能调用 trait 方法

## Part 3 实现规则：一致性（孤儿规则）

trait 的具体实现规则是：**只有 trait 或类型（或两者）本地到当前 crate 时，才能实现它**

| 场景 | 例子 | 能否实现 |
| --- | --- | --- |
| trait 本地，类型本地 | `Summary` 与 `SocialPost` 都在 aggregator | 能 |
| trait 本地，类型外部 | `Summary` 在 aggregator，`Vec<T>` 来自 std | 能（trait 本地即可） |
| trait 外部，类型本地 | `Display` 来自 std，`SocialPost` 在 aggregator | 能（类型本地即可） |
| trait 外部，类型外部 | `Display` 和 `Vec<T>` 都来自 std | **不能** |

这个限制属于一种叫 **coherence（一致性）** 的性质，具体叫 **orphan rule（孤儿规则）**（「孤儿」指父类型不在现场）。它的作用是保证别人的代码不会破坏你的代码，反之亦然：如果没这条规则，两个 crate 可以对同一个类型实现同一个 trait，Rust 就不知道到底该用哪个实现了。这也是 trait 和「接口」的一个关键差异

## Part 4 默认实现

有时希望 trait 里的某些（甚至全部）方法**有默认行为**，而不是要求每个类型都实现所有方法。实现 trait 时，对每个方法可以保留默认实现，也可以覆盖它

```rust
pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}

impl Summary for NewsArticle {}
```

注意这里的写法：定义 trait 时给 `summarize` 提供了函数体（不再以分号结尾）。对 `NewsArticle` 用一个**空 `impl` 块** `impl Summary for NewsArticle {}` 即可，实例照样能调 `summarize`，得到默认值 `(Read more...)`。覆盖默认实现的语法，和实现一个没有默认实现的方法**完全相同**

### 4.1 默认实现可以调用同 trait 的其他方法

默认实现可以调用 trait 里的其他方法，**即使那些方法没有默认实现**。这样 trait 能提供大量现成功能，实现者只需要补上一小部分

```rust
pub trait Summary {
    fn summarize_author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

impl Summary for SocialPost {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}
```

这里 `summarize_author` 是**必须实现**的，`summarize` 有默认实现、且默认实现里调用了 `summarize_author`。实现 `SocialPost` 时只需要写 `summarize_author`，`summarize` 就能工作：打印 `1 new post: (Read more from @horse_ebooks...)`

**注意：在覆盖实现里，无法调用同一个方法的默认实现**——覆盖后默认版本就不存在了

## Part 5 trait 作为参数：impl Trait 与 trait bound

我们还能将 trait 当作参数传入函数

定义一个 `notify` 函数，对参数 `item` 调用 `summarize`，`item` 可以是任意实现了 `Summary` 的类型。用 **impl Trait** 语法：

```rust
pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}
```

参数类型写 `impl` 关键字 + trait 名，接受任何实现了指定 trait 的类型。函数体里可以调用 `Summary` 提供的方法。传 `NewsArticle`、`SocialPost` 都行；传 `String`、`i32` 这类没实现 `Summary` 的类型，**编译不过**（错误信息会提示 trait bound 不满足）

### 5.1 trait bound：impl Trait 的完整形式

`impl Trait` 是下面这种**trait bound（trait 约束）**的语法糖：

```rust
pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}
```

trait bound 写在尖括号里、冒号之后，和泛型类型参数一起声明

两种形式的选择：`impl Trait` 在简单场景更简洁；完整的 trait bound 能表达更复杂的约束

### 5.2 两个参数：允许不同类型还是强制相同

两个参数都用 `impl Trait`：

```rust
pub fn notify(item1: &impl Summary, item2: &impl Summary) {
```

允许 `item1` 和 `item2` 是**不同类型**（只要都实现 `Summary`）。如果要强制两个参数是**同一个类型**，必须用 trait bound：

```rust
pub fn notify<T: Summary>(item1: &T, item2: &T) {
```

这里的 `T` 把两个参数绑定在一起——传进来的两个值必须是同一个具体类型

### 5.3 多约束用 +

想让 `item` 既能 `summarize` 又能用 `{}` 格式化，就要求它同时实现 `Summary` 和 `Display`，用 `+` 连接多个约束：

```rust
pub fn notify(item: &(impl Summary + Display)) {
```

`+` 语法在 trait bound 上同样有效：

```rust
pub fn notify<T: Summary + Display>(item: &T) {
```

## Part 6 where 子句：美化多约束的函数签名

每个泛型参数都有自己的约束，函数里有多个泛型参数时，函数签名会很难读。所以 Rust 提供了在函数签名**之后**写 `where` 子句的替代语法

不写 `where` 时：

```rust
fn some_function<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {
```

改用 `where` 子句：

```rust
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{
    unimplemented!()
}
```

## Part 7 返回实现了 trait 的类型

返回位置也能用 `impl Trait`：函数返回「某种实现了 `Summary` 的类型」而不点名具体类型：

```rust
fn returns_summarizable() -> impl Summary {
    SocialPost {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        repost: false,
    }
}
```

这里返回的是 `SocialPost`，但调用方**不需要知道这一点**。好处有三：

1. **隐藏具体类型**：调用方只依赖「它实现了 `Summary`」
2. **简化后续修改**：以后把返回类型换成另一个实现 `Summary` 的类型，调用方代码一行都不用改
3. **零成本抽象**：`impl Trait` 在编译期就确定具体类型（单态化），运行时的表现和直接写具体类型一模一样

这种写法尤其适合**闭包和迭代器**：它们产生的类型只有编译器知道，或者长到写不完。用 `impl Iterator` 就能简洁地说明「返回一个实现了 `Iterator` 的类型」，不用写出那一长串类型名

### 7.1 限制：不支持不同类型分支

`impl Trait` 只能返回**单一类型**。下面这个函数想根据 `switch` 要么返回 `NewsArticle`、要么返回 `SocialPost`，就编译不过：

```rust
fn returns_summarizable(switch: bool) -> impl Summary {
    if switch {
        NewsArticle {
            headline: String::from("Penguins win the Stanley Cup Championship!"),
            location: String::from("Pittsburgh, PA, USA"),
            author: String::from("Iceburgh"),
            content: String::from("The Pittsburgh Penguins once again are the best hockey team in the NHL."),
        }
    } else {
        SocialPost {
            username: String::from("horse_ebooks"),
            content: String::from("of course, as you probably already know, people"),
            reply: false,
            repost: false,
        }
    }
}
```

这是因为编译器实现 `impl Trait` 的方式有这个限制。想写出「返回类型在多个具体类型之间切换」的函数，后面章节会提到

## Part 8 利用 trait bound 有条件地实现方法

用带 trait bound 的 `impl` 块，可以对满足条件的类型**条件性地实现方法**：

```rust
use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}
```

`Pair<T>` 无条件提供 `new` 方法；但 `cmp_display` 只在内部类型 `T` 同时实现了 `PartialOrd`（能比较）和 `Display`（能打印）时才存在。类型没满足约束时调用 `cmp_display`，编译器会直接报错

## Part 9 blanket 实现

还可以条件性地为「实现了某个 trait 的任意类型」实现另一个 trait。这类实现叫 **blanket implementation（覆盖实现）**，标准库里用得非常广泛。比如标准库为所有实现 `Display` 的类型实现了 `ToString`：

```rust
impl<T: Display> ToString for T {
    // --snip--
}
```

正是因为有这个 blanket 实现，任何实现 `Display` 的类型都能调 `to_string` 方法，整数实现了 `Display`，所以可以：

```rust
let s = 3.to_string();
```

blanket 实现会显示在 trait 文档的「Implementors」部分

## 小结

| 概念 | 一句话 |
| --- | --- |
| trait | 定义某个类型具有、且能与其他类型共享的功能，类似接口但有区别 |
| 定义语法 | `pub trait Summary { fn summarize(&self) -> String; }`，签名以分号结尾 |
| 实现语法 | `impl Summary for NewsArticle { ... }`，签名必须与 trait 定义一致 |
| 孤儿规则 | 只能实现「trait 或类型至少一方本地到 crate」的 trait，保证一致性 |
| 默认实现 | 方法可以带默认函数体，实现者保留或覆盖；覆盖版调不到默认版 |
| `impl Trait` 参数 | `item: &impl Summary`，接受任何实现 `Summary` 的类型 |
| trait bound | `T: Summary`，是 `impl Trait` 的完整形式，可强制两参数同类型 |
| 多约束 `+` | `T: Summary + Display`，要求同时满足多个 trait |
| `where` 子句 | 多约束时移到函数签名后，让签名更好读 |
| `impl Trait` 返回 | 只按 trait 声明返回类型，隐藏具体类型、便于修改、零成本 |
| 返回值限制 | 只能返回单一具体类型；多分支切换要用 trait 对象（第 18 章） |
| 条件实现方法 | `impl<T: Display + PartialOrd> Pair<T>`，方法只对满足约束的类型存在 |
| blanket 实现 | `impl<T: Display> ToString for T`，给所有满足某约束的类型批量实现 |
