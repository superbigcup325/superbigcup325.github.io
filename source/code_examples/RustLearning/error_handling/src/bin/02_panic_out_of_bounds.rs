fn main() {
    let v = vec![1, 2, 3];

    // 试图访问第 100 个元素（下标 99），Vector 只有 3 个元素
    // 越界访问会触发 panic，Rust 拒绝继续执行
    v[99];
}
