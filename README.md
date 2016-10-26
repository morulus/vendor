Vedor.js
======

Vendor.js is another way to use AMD on frontend.

## Connect to page
Put vendor.js into public root of your project. Connect vendor.js to your page:
```html
<script src="myproject/vendor.js"></script>
```
Now, vendor.js is ready to work. Option `baseUrl` in library configuration become automaticly to 'myproject/'. WHat it means? Any request with relative paths will search file in the `baseUrl` folder. For example:

### getting js file from the folder `myproject/js`
```javascript
vendor('js/myscript.js');
```
It will load `myproject/js/myscript.js`. Capish?

_So, you can get many files:_
```javascript
vendor(['js/myscript.js','bower_components/jquery/dist/jquery.js','widgets/callback/callback.js']);
```
_Or, get different types of files:_
```javascript
vendor(['js/myscript.js','style/main.css','images/background.jpg']);
```

### Use depends
As well as in the RequireJs it's supports dependencies. If your module supports define(), you can get the fabric of module by the vendor() function. Just like this:
```javascript
vendor('bower_components/jquery/dist/jquery.js', function($) {
    $("body").html("jQuery connected!");
});
```

_You can use nesting:_
```javascript
vendor('bower_components/jquery/dist/jquery.js', function() {
  vendor('js/myscript.js', function(my) {
});
});
```

_Or, run your script only after loading images_
And that script which you intend to use, you can load in one queue with other images.
```javascript
vendor(['js/gallery.js','image1.jpg','image2.jpg','image3.jpg'], function(makegallery, image1,image2,image3) {
 makegallery(image1,image2,image3);
});
```
Brilliant?

### Talk about bower components
_Load bower package by the force_
```javascript
vendor(['bower//bootstrap'], function() {
 // Bootstrap just ready
});
```
Well. Do you think this record loads only bootstrap.js? No, you're wrong. It loads all files you need from this package (js and css, if you remember). You can say enough, but it is not. Bootstrap required jQuery, so that simple record loads jQuery too from bower_components/ folder.

You can change default bower folder by the calling function vendor.config({bowerUrl:'mybowers/'}) or by the _.bowerrc_ file in the root folder of project. Vendor.js will inspect this file and get option `direction` to use it.

### Define
_You can use define() function:_
```javascript
define('mymodule', ['js/myscript.js'], function() {
  return {
    hello: function() { alert('Hello'); }
  }
});
```

### Relative paths in define
```javascript
define('magic', ['.myscript2.js'], function() {
  return 'ok';
});
```

### Getting css files
You can get CSS files as well as get Js-files with function vendor.requirecss(string || array) or vendor(string || array)
```javascript
vendor("css/main.css");
```

### baseUrl
By defaults Vendor.js chooses `baseUrl` by getting location of vendor.js. Don't rename file `vendor.js`! This name is a anchor to search base location. But if you will, you can configure this option manualy:
```javascript
vendor.config({
    baseUrl: 'mynewfolder/scripts/'
});
```
This script will get file `mynewfolder/scripts/foo.js'
```
vendor('foo');
```

### Debug
Debugging works with two functions: debug() and watch()

#### debug()
Use vendor.debug function to see reports in console
```
vendor.config({
    paths: {
        'jquery': 'vendor/jquery/dist/jquery'
    }
});
vendor('jquery');
```

#### watch(filename) 
Use vendor.watch to watch reports only for [filename]
```
vendor.watch('file.js', ['./load/my/file.js'], function() {});
```

## Browsers supports
Chrome,FF,Opera,Safari,webkit's browser in short, IE8+

## Author
Vladimir Morulus (https://github.com/morulus/)

## Why reinvent the wheel??
What different between Requirejs, for example? — you can say. Simple reasons — the existence of Coca-Cola exclude the existence of other drinks? Good day.

## P.S
Sorry my english.