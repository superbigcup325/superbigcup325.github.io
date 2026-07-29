fn main() {
    let user = User {
        email: String::from("123@example.com"),
        username: String::from("123"),
        active: true,
        sign_in_count: 1,
    };

    let mut user1 = build_user(String::from("123@example.com"), String::from("123"));

    user1.email = String::from("345@example.com");

    let user2 = User {
        email: String::from("another@example.com"),
        ..user1
    };
}

fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}

// 使用 PascalCase，各单词首字母大写，单词之间无空格或下划线
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}
