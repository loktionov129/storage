const getObjectProperty = function(path, object) {
    if (!path) { return object; }
    return path.split('.').reduce(function(prev, curr) {
      return prev ? prev[curr] : undefined
    }, object);
  }
  
  const anyObject = {
    version: '1.3.1',
    data: {
      name: 'John Smith',
      age: 25
    }
  };
  
  
  console.log('path', obj);
