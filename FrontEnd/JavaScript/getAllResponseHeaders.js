// [Deprecation] Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience.
// For more help, check https://xhr.spec.whatwg.org/.
(function()
{
  function read(url)
  {
    var r=new XMLHttpRequest();
    r.open('HEAD',url,false);
    r.send(null);
    return r.getAllResponseHeaders();
  }
  
  console.log(read(window.location));
})();
