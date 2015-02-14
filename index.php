<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Vendor.js</title>
	<link rel="stylesheet" href="style/patch-layout.css" />
	<link rel="stylesheet" href="style/main.css" />
	
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.4/styles/zenburn.min.css" />
	<script src="vendor.js" no-bower></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.4/highlight.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.4/languages/javascript.min.js"></script>
	<script>hljs.initHighlightingOnLoad();</script>
</head>
<body>
	<section>
		<div class="container">
			<div class="row">
				<div class="col-sm-6">
					<img src="images/vendorjs.png" alt="" class="logo" />
					<summary class="white">
						Асинхронный загрузчик js-файлов, модулей, css и изображений для использования в браузерных приложениях.
					</summary>
					<summary>Vendor.js доступен через Bower. Однако для удобства работы с ним, сам файл vendor.js вам необходимо будет переместить в директорию, которая будет являться "домашней" для ваших ресурсов.</summary>
					<pre><code><?=htmlspecialchars('bower install vendor
mv /bower_components/vendor/vendor.js vendor.js')?></code></pre>
				</div>
				<div class="col-sm-6">
					<h4>Простое подключение без дополнительных настроек</h4>
					<pre><code><?=htmlspecialchars(
	"<script src=\"vendor.js\"></script>"
	)?></code></pre>
					<summary>Vendor воспринимает директорию, в которой находится файл vendor.js, в качестве «домашней». Т.е. сам файл vendor.js следует разместить в корневой директории сайта или директории, в которой сосредоточены ресурсы.</summary>
					<summary>Все относительные пути будут расчитываться относительно директории, в которой лежит vendor.js:</summary>
					<pre><code><?=htmlspecialchars(
	"vendor(['scripts/myscript.js','styles/main.css'], handler);"
	)?></code></pre>
				</div>
				<div class="col-sm-12">
					<article class="downloads">
						<a href="">Скачать сжатую версию (14 kb)</a> <a href="">Скачать дистрибутив [developer only]</a> 
					</article>
						
				</div>				
				<div class="col-sm-6 centered">
					<h4>Прелоудер изображений</h4>
					<summary>Вы можете создавать предварительные загрузки изображений, получая их объекты в качестве аргументов callback-функции.</summary>
					<pre><code class="javascript"><?=htmlspecialchars(
	"vendor.images(['images/mypic1.jpg','images/mypic2.jpg'], function(pic1,pic2) {
		// Фотографии загружены
	});"
	)?></code></pre>
					
				</div>
				<div class="col-sm-6 centered">
					<h4>Асинхронная загрузка стилей</h4>
					<summary>Загрузка стилей происходит по тому же принципу, что и загрузка js-файлов.</summary>
					<pre><code class="javascript"><?=htmlspecialchars(
	"vendor.requirecss(['styles/primary.css','styles/secondary.css'], function() {
		// Стили загружены
	});"
	)?></code></pre>
					
				</div>

				<div class="col-sm-6 centered">
					<h4>Асинхронная загрузка bower-компонентов</h4>
					<summary>Каждый bower-компонент может быть загружен вместе со всеми скриптами, стилями и зависимостями по одному имени пакета.</summary>
					<pre><code class="javascript"><?=htmlspecialchars(
	"vendor.bower(['bootstrap'], function() {
		// Помимо файлов bootstrap, будет так же подключен jQuery
	});"
	)?></code></pre>
				</div>
				<div class="col-sm-6 centered">
					<h4>Классика жанра: define(), require()</h4>
					<summary>Вы можете использовать базовый функционал require и define как в RequireJs.</summary>
					<pre><code class="javascript"><?=htmlspecialchars(
	"require(['module/my.js'], function(my) { define('mod2',function() { return my.factory; }); });"
	)?></code></pre>
				</div>
				<div class="col-sm-6 centered">
					<h4>Перебор ресурсов</h4>
					<summary>Возможность вызова callback для каждого загруженного файла с доступом к информации о прогрессе загрузки</summary>
					<pre><code class="javascript"><?=htmlspecialchars(
	"vendor(['module/my.js','images/image.png']).each(function(res) {
		console.log('loading progress '+(100*this.progress)+'%');
	});"
	)?></code></pre>
				</div>
				<div class="col-sm-6">
					<h4>Единый интерфейс для всех поддерживаемых типов ресурсов</h4>
					<summary>Весь функционал доступен через единую функцию vendor(). Т.е. вы можете не писать вызов методов require, requirecss, images, bower, что бы загрузить определенный тип файлов. Просто расскажите функции vendor, что вам нужно загрузить и она это сделает.</summary>
					<pre><code class="javascript"><?=htmlspecialchars(
	"vendor(['go.js','go.png','bower/jquery','go.css'], 
		function(module, image, jquery) {
			// Все файлы загружены
		}
	);"
	)?></code></pre>
					<summary>Для загрузки bower-компонентов через функцию vendor необходимо указывать префикс bower/.</summary>
				</div>
				<div class="col-sm-6 centered">
					<h4>Настройка глобальных переменных</h4>
					<summary>После загрузки бибилиотеки можно в ручную указать параматеры путей baseUrl — "домашняя директория", bowerUrl — папка компонентов bower, paths - алиасы.</summary>
					<pre><code class="javascript"><?=htmlspecialchars(
	"vendor.config({
		baseUrl: 'scripts/',
		bowerUrl: 'scripts/vendor/',
		paths: {
			'mymods': 'scripts/mods/my/'
		}
	});"
	)?></code></pre>
					
				</div>
				<div class="col-sm-6 centered">
					<h4>Кроссбраузерность</h4>
					<summary>На данный момент бибилиотека поддерживает все современные браузеры и IE8+.</summary>
				</div>
			</div>
		</div>
	</section>
	<section>
		<div class="container">
				<article>Автор: <a href="http://github.com/morulus/" title="Vladimir Kalmykov (@morulus)" class="contact">@morulus<img src="images/morulus.png" /></a> Версия: <span class="version" id="version">1.4</span></article>
		</div>
	</section>
	<a href="https://github.com/morulus/vendor/"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/652c5b9acfaddf3a9c326fa6bde407b87f7be0f4/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6f72616e67655f6666373630302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png"></a>
</body>
<script>
	vendor.getJson('bower.json', function(info) {
		document.getElementById('version').innerHtml(info.version);
	});
</script>
</html>