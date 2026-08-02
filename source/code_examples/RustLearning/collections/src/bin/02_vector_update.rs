fn main() {
    let mut v = vec![1, 2, 3, 4, 5];

    // 追加到末尾
    v.push(6);
    println!("after push: {:?}", v);

    // 指定位置插入
    v.insert(0, 0);
    println!("after insert: {:?}", v);

    // 弹出末尾元素，返回 Option<T>
    let last = v.pop();
    println!("popped: {last:?}, v: {:?}", v);

    // 删除指定位置，返回被删除的元素
    let removed = v.remove(1);
    println!("removed: {removed}, v: {:?}", v);

    // 索引访问：越界会 panic
    let third = v[2];
    println!("v[2] = {third}");

    // get() 返回 Option<&T>，越界返回 None，更安全
    match v.get(2) {
        Some(value) => println!("get(2) = {value}"),
        None => println!("out of range"),
    }
    println!("get(100) = {:?}", v.get(100));

    // 通过索引修改
    v[0] = 10;
    println!("after modify: {:?}", v);
}
