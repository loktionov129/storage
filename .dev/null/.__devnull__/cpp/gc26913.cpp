int main()
{   
    using output1 = Eval<
        Input<'H', 'e', 'l', 'l', 'o'>,
        App<
            ',', '>', ',', '>', ',', '>', ',', '>', ',', '>',
            '<', '.', '<', '.', '<', '.', '<', '.', '<', '.'
        >
    >;
    std::cout << "Hello reverse (read/write): " << SpanToStringContinuous<output1>::value() << std::endl;

    using output2 = Eval<
        Input<>,
        App<'+', '+', '+', '[', '-', ']'>
    >;
    std::cout << "Simple loop (empty output): " << SpanToStringContinuous<output2>::value() << std::endl;

    // Source: Wikipedia
    using output3 = Eval<
        Input<>,
        App<
            '+', '+', '+', '+', '+', '+', '+', '+', '[', '>', '+', '+', '+',
            '+', '[', '>', '+', '+', '>', '+', '+', '+', '>', '+', '+', '+',
            '>', '+', '<', '<', '<', '<', '-', ']', '>', '+', '>', '+', '>',
            '-', '>', '>', '+', '[', '<', ']', '<', '-', ']', '>', '>', '.',
            '>', '-', '-', '-', '.', '+', '+', '+', '+', '+', '+', '+', '.',
            '.', '+', '+', '+', '.', '>', '>', '.', '<', '-', '.', '<', '.',
            '+', '+', '+', '.', '-', '-', '-', '-', '-', '-', '.', '-', '-',
            '-', '-', '-', '-', '-', '-', '.', '>', '>', '+', '.', '>', '+',
            '+', '.'
        >
    >;
    std::cout << "Hello World (wiki): " << SpanToStringContinuous<output3>::value() << std::endl;


    return EXIT_SUCCESS;
}
