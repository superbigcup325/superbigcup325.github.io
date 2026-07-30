fn main() {

}

enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

// compare to struct
struct QuitMessage;
struct MoveMessage {
    x: i32, 
    y: i32,
}
struct WriteMessage(String);
struct ChangeColorMessage(i32, i32, i32);

fn foo(message: &Message) {}