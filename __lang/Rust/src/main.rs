pub mod greeter;
pub mod math;

use greeter::Greeter;
use math::{add, divide};

fn main() {
    let greeter = Greeter;
    println!("{}", greeter.greeting(None));
    println!("2 + 3 = {}", add(2.0, 3.0));
    println!("10 / 2 = {:?}", divide(10.0, 2.0));
    println!(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_main_runs_without_panic() {
        main();
    }
}
