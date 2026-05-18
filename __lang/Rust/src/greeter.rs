pub struct Greeter;

impl Greeter {
    pub fn greeting(&self, name: Option<&str>) -> String {
        let name = name.unwrap_or("World");
        format!("Hello, {}!", name)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greeting_default() {
        let greeter = Greeter;
        assert_eq!(greeter.greeting(None), "Hello, World!");
    }

    #[test]
    fn greeting_with_name() {
        let greeter = Greeter;
        assert_eq!(greeter.greeting(Some("Alice")), "Hello, Alice!");
    }
}
