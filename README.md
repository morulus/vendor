Vedor.js
======

Vendor.js it's another way to use AMD on frontend.

## Connect to page
Put vendor.js to main folder of your project. Connect vendor.js to your page:
```html
<script src="myproject/vendor.js"></script>
```
Now, baseUrl is automaticly 'myproject/' and you can include files from this:

### Include js files
```javascript
include('js/myscript.js');
// It will include myproject/js/myscript.js
```

_So, you can include many files:_
```javascript
include(['js/myscript.js','bower_components/jquery/dist/jquery.js','widgets/callback/callback.js']);
// Include all of files in list
```

_You can use depends:_
```javascript
include('bower_components/jquery/dist/jquery.js', function() {
    $("body").html("jQuery connected!"); // This script rub only after jQuery ready stage
});
```

_You can use nesting:_
```javascript
include('bower_components/jquery/dist/jquery.js', function() {
  include('js/myscript.js'); // This script will be load only after jquery.js
});
```

_It's supports AMD:_
```javascript
include('js/mymodule.js', function(mymodule) {
  mymodule.hello();
});
```

_You can use define():_
```javascript
define('mymodule', ['js/myscript.js'], function() {
  return {
    hello: function() { alert('Hello'); }
  }
});
```
### Include css files
You can include CSS file like Js files with function includecss(string || array)
```javascript
includecss("css/main.css");
```

### baseUrl
By defaults Vendor.js choose `baseUrl` which contains the vendor.js. Don't rename file `vendor.js`! This name is a anchor to search base location.
But you can configure this option manualy:
```
include.config({
    baseUrl: 'mynewfolder/scripts/'
});
```
This script will include file `mynewfolder/scripts/foo.js'
```
include('foo');
```

### Aliases
You can set aliases with config.paths like in Require.js.
```
include.config({
    paths: {
        'jquery': 'vendor/jquery/dist/jquery'
    }
});
include('jquery');
```

## Browsers supports
Chrome,FF,Opera,Safari,webkit's browser in short, IE9+

## Author
Vladimir Morulus (https://github.com/morulus/)

## Why reinvent the wheel??
What different between Requirejs, for example? — you can say. Simple reasons — lighter and not so strict. Anywat, I created this library for their own reasons, to use it or not - your business.
