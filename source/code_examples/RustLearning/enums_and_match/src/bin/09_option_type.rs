fn main() {
    let x = 5;
    let y: Option<i32> = Some(2);

    // x += y;
    // error[E0369]: cannot add `Option<i32>` to `{integer}`
}

// enum Option<T> {
//     Some(T),
//     None,
// }