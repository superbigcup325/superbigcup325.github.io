fn hello_world() {
    println!("hello world");
}

fn print_labled_measurement(value: i32, unit_label: char) {
    println!("the measurement is: {value}{unit_label}");
}

fn main() {
    hello_world();
    print_labled_measurement(5, 'h');
}
