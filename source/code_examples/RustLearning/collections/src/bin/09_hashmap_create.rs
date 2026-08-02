use std::collections::HashMap;

fn main() {
    // HashMap::new() 创建空 map
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
    println!("scores: {:?}", scores);

    // collect()：从键值对迭代器构建
    // 先将两个向量 zip 合并为元组迭代器，再 collect 成 HashMap
    let teams = vec![String::from("Blue"), String::from("Yellow")];
    let initial_scores = vec![10, 50];
    let scores2: HashMap<_, _> = teams.iter().zip(initial_scores.iter()).collect();
    println!("scores2: {:?}", scores2);
}
