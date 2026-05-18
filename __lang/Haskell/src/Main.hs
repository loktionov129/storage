module Main where

import Math

-- Простая функция для приветствия
sayHello :: String -> String
sayHello name = "Hello, " ++ name ++ "! Haskell is running in Docker."

main :: IO ()
main = do
    putStrLn $ sayHello "GitHub User"
    putStrLn "--- Haskell Math Samples ---"
    
    -- Используем putStrLn для вывода склеенных строк
    putStrLn $ "Factorial of 5: " ++ show (factorial 5)
    putStrLn $ "First 10 Fibonacci numbers: " ++ show (take 10 fibs)
    putStrLn $ "Sorted list: " ++ show (quicksort [5,1,9,4,3,2])
