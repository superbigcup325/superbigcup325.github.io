use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    // get()：接收键的引用，返回 Option<&V>
    let team = String::from("Blue");
    let score = scores.get(&team).copied().unwrap_or(0);
    println!("Blue: {score}");

    // 遍历：顺序不确定，与插入顺序无关
    for (key, value) in &scores {
        println!("{key}: {value}");
    }

    // 所有权：insert 时 key/value 的所有权被转移进 map
    let field_name = String::from("Blue");
    let field_value = 10;
    let mut map = HashMap::new();
    map.insert(field_name, field_value);
    // println!("{field_name}"); // 编译错误：field_name 已被移动
    println!("map: {map:?}");
}
