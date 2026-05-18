pub fn add(a: f64, b: f64) -> f64 {
    a + b
}

pub fn divide(a: f64, b: f64) -> Result<f64, &'static str> {
    if b == 0.0 {
        Err("Cannot divide by zero")
    } else {
        Ok(a / b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_integers() {
        assert_eq!(add(1.0, 2.0), 3.0);
    }

    #[test]
    fn test_add_floats() {
        assert_eq!(add(0.1, 0.2), 0.30000000000000004); // Точная проверка как в Python
    }

    #[test]
    fn test_divide_success() {
        assert_eq!(divide(10.0, 2.0), Ok(5.0));
    }

    #[test]
    fn test_divide_by_zero() {
        assert_eq!(divide(10.0, 0.0), Err("Cannot divide by zero"));
    }
}
