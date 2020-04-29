namespace cmd

module hacks =
    // strings
    let text = "asdfg
    \"asdfa\"
    gef"

    let text2 = """asdfg
    "asdfa"
    gef"""

    let text3 = @"asdf\r\n ""asdfa"" gef"

    // lists
    let intlist = [1;3;4;2;5]
    let seqlist = [1..10] // [1; 2; 3; 4; 5; 6; 7; 8; 9; 10]
    let steplist = [0..2..10] // [0; 2; 4; 6; 8; 10]
    let reverselist = [10..-1..0] // [10; 9; 8; 7; 6; 5; 4; 3; 2; 1; 0]
    let adtoheadlist = 1::[5;7] // [1;5;7]
    let concatlist = [4;2] @ [5;7] // [4; 2; 5; 7]