enum IpAddrKind {
    V4(u8, u8, u8, u8), // Variants
    V6(String),
}

struct IpAddr {
    kind: IpAddrKind, // Field
    address: String,  // Field
}

fn main() {
    let home = IpAddr {
        kind: IpAddrKind::V4(127, 0, 0, 1),
        address: String::from("localhost"),
    };
}