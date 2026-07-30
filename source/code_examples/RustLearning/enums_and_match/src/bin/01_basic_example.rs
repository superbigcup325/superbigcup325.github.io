fn main() {
    let four = IpAddrKind::V4;
    let six = IpAddrKind::V6;

    route(four);
    route(six);
}

fn route(ip_kind: IpAddrKind) {
    // code to route the IP address
}

// PascalCase
enum IpAddrKind {
    V4, // Variants
    V6,
}