namespace cmd

module flow =
    let ifelse x =
        if x = 0 then
            printfn "x = 0"
        else if x > 0 then
            printfn "x > 0"
        else
            printfn "x < 0"

    let forloop = 
        for x in 1..10 do
            printfn "%d" x