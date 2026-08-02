use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);

    // insert：键已存在时覆盖旧值
    scores.insert(String::from("Blue"), 25);
    println!("scores: {:?}", scores);

    // entry().or_insert()：只在键不存在时插入，已存在则不改变
    scores.entry(String::from("Yellow")).or_insert(50);
    scores.entry(String::from("Blue")).or_insert(50);
    println!("scores: {:?}", scores);

    // or_insert 返回值的可变引用，可以基于现有值更新
    let text = "hello world wonderful world";
    let mut map = HashMap::new();
    for word in text.split_whitespace() {
        let count = map.entry(word).or_insert(0);
        *count += 1;
    }
    println!("map: {:?}", map);
}
