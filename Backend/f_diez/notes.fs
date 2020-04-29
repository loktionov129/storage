namespace cmd

module notes =
    open System

    // usage: sum ("hello WOrld", 2)
    // or: ("hello WOrld", 2) |> sum
    //
    // output: hello WOrld
    // ret: 42
    let sum ((a, b): string * int) = 
        printfn "%s" a
        40 + b




    // usage: dp ("hello WOrld", 2)
    // or: ("hello WOrld", 2) |> dp

    // output: int: 2 & string: hello WOrld
    // ret: Unit
    let dp ((a, b): string * int) = 
        (b, a)
            ||> printfn "int: %d & string: %s"



    // usage: fc 42
    // or: 42 |> fc

    // output: 83\n82
    // ret: Unit
    let fc x = 
        let minus1 value = value - 1
        let mult2  value = value * 2

        x
        |> (minus1 << mult2)
        |> printfn "%d"
        // 42 * 2 - 1 = 83

        x
        |> (minus1 >> mult2)
        |> printfn "%d"
        // 42 - 1 * 2 = 82


    //fizzbuzz
    let fizzbuzz =
        let fizzbuzzer x = 
            match x with
                | _ when x % 3 = 0 && x % 5 = 0 -> "fizzbuzz"
                | _ when x % 3 = 0 -> "fizz"
                | _ when x % 5 = 0 -> "buzz"
                | _ -> string x

        [1..100]
            |> List.map fizzbuzzer
            |> List.iter (printfn "%s")


