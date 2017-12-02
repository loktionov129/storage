// Animated scroll to HTML-anchor
// author: Shailesh
// post: https://stackoverflow.com/a/28564802/6727660﻿

$('a[href^="#"]').on('click', function(event) {

    var target = $( $(this).attr('href') );

    if( target.length ) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: target.offset().top
        }, 500);
    }

});
