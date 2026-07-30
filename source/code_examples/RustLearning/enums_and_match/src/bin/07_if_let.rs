fn main() {
    let config_max = Some(3u8);

    if let Some(max) = config_max {
        println!("the maximum number is {max}");
    }
    else {
        println!("None");
    }
    // match &config_max {
    //     Some(max) => println!("the maximum number is {max}"),
    //     _ => (),
    // }
}