Ajax-uploader
=============

...but it's not ajax really. Naming things is hard .(


Files uploader
==============

It's javascript class for dynamic uploading of files via iframe.
* create hidden iframe and use it as the target for form
* form is proceeded on background, then reseted and can be reused
* upload's response can contain data to be displayed in no time

Basic uploader
--------------

* ...just upload data and that's all
* *selInputWrapper have to be inside form or to be form itself (always)*

```html
<script>
	new AjaxUploader({
		selInputWrapper: ".input_wrapper"
	});
</script>
<form action="/image/upload/" method="post" enctype="multipart/form-data">
    <div class="input_wrapper">
		<input type="file" name="image"/>
	</div>
</form>
```


Uploader with status messages
-----------------------------

* display messages while upload

```html
<script>
	new AjaxUploader({
		selInputWrapper: ".input_wrapper",
		selMessages: ".upload_messages"
	});
</script>
<form action="/image/upload/" method="post" enctype="multipart/form-data">
    <div class="input_wrapper">
		<input type="file" name="image"/>
	</div>
</form>
<div class="upload_messages">
	<div class="alert">Shows sucess/progress/alert informations</div>
	<div class="progress">Progress bar while uploading</div>
</div>
```


Uploader with response canvas
-----------------------------

* provides canvas to display data from response

```html
<script>
	new AjaxUploader({
		selInputWrapper: ".input_wrapper",
		selThumbnails: ".canvas"
	});
</script>
<form action="/image/upload/" method="post" enctype="multipart/form-data">
    <div class="input_wrapper">
		<input type="file" name="image"/>
	</div>
</form>
<div class="canvas">
	<!--
	this node will contains html from response if response contains
	following json structure:

	[{
		file: {
			html: "<p>result to display in this node</p>"
		}
	}]

	-->
</div>
```


Object options
==============

<table>
<tr>
<td>msgUploading</td>
<td>message displayed while uploading</td>
</tr><tr>
<td>msgUploadError</td>
<td>message for upload error</td>
</tr><tr>
<td>msgUploadSuccess</td>
<td>message for complete upload</td>
</tr><tr>
<td>msgDeleteConfirm</td>
<td>message for delete confirmation</td>
</tr><tr>
<td>selInputWrapper</td>
<td>selector for close wrapper of file input</td>
</tr><tr>
<td>selMessages</td>
<td>selector for close messages' wrapper</td>
</tr><tr>
<td>selThumbnails</td>
<td>selector for (response's) thumbnails wrapper</td>
</tr><tr>
<td>selThumbnailWrapper</td>
<td>selector for existing thumbnail (used while deleting to remove given DOM node)</td>
</tr><tr>
<td>selFormMirror</td>
<td>selector for mirror form<br/>
- when there's a need to have input in different form which has mismatching params (target/enctype/method) then you can use another (hidden) form to submit your input. File input is copied in there and given form is submitted instead of input's parent form.</td>
</tr><tr>

<td>djangoCsrf</td>
<td>if you use Django, csrf token is added. Set to false otherwise</td>
</tr><tr>
<td>onUpload</td>
<td>your custom action to run after success upload</td>
</tr><tr>
<td>beforeUpload</td>
<td>your custom action to run before upload</td>
</tr>
</table>